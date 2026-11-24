import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildContext } from '../context.js';
import { approveTask, completeTask, dispatchTask, getLedgerPath, retryTask } from '../dispatch.js';
import { ALLOWED_LEDGER_TRANSITIONS, CircuitBreakerError, readLedger } from '../ledger.js';

function createPrng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function setupFuzzRepo(): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-inv-'));
  fs.mkdirSync(path.join(tmp, 'organization'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'projects', 'fuzz', 'product'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'projects', 'fuzz', 'marketing'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'projects', 'fuzz', 'development'), { recursive: true });

  fs.writeFileSync(
    path.join(tmp, 'organization', 'project-registry.md'),
    `| \`project_id\` | Name | Status | Context Path | Authorized External Repositories |\n|---|---|---|---|---|\n| \`fuzz\` | Fuzz | \`active\` | [project-context.md](../projects/fuzz/project-context.md) | None |\n## Rules\n`,
  );
  fs.writeFileSync(
    path.join(tmp, 'projects', 'fuzz', 'project-context.md'),
    `---\ndoc_id: PRJ-FUZZ-CTX\nproject_id: fuzz\ndepartment: orchestration\ndoc_type: project-context\nowner: chief-of-staff\nstatus: active\naccess_classification: internal\n---\n# Fuzz Context\n`,
  );
  fs.writeFileSync(
    path.join(tmp, 'projects', 'fuzz', 'development', 'internal-notes.md'),
    `---\ndoc_id: DEV-FUZZ-001\nproject_id: fuzz\ndepartment: development\ndoc_type: decision-record\nowner: fuzz-eng-lead\nstatus: active\naccess_classification: private-engineering\n---\n# Secret Engineering Notes\n`,
  );

  const leads = [
    { id: 'fuzz-prd-lead', dept: 'product', cls: 'internal' },
    { id: 'fuzz-mkt-lead', dept: 'marketing', cls: 'public-marketing' },
    { id: 'fuzz-eng-lead', dept: 'development', cls: 'private-engineering' },
  ];
  for (const l of leads) {
    fs.writeFileSync(
      path.join(tmp, 'projects', 'fuzz', l.dept, 'lead.md'),
      `---\nagent_id: ${l.id}\nname: ${l.id}\nproject_id: fuzz\ndepartment: ${l.dept}\nrole: Lead\nreports_to: chief-of-staff\nstatus: active\naccess_classification: ${l.cls}\ntools: [filesystem-read]\npermissions:\n  read: [projects/fuzz/]\n  write: [projects/fuzz/${l.dept}/]\n  execute: []\n  external_action: none\nprovider_policy: default\n---\n`,
    );
  }
  return tmp;
}

describe('workflow property-based invariants & concurrency safety', () => {
  it('preserves ledger state machine, Level 3 gates, hop/retry caps, and isolation across 120 randomized workflows', () => {
    const rand = createPrng(20261124);
    const tmp = setupFuzzRepo();
    try {
      const agents = [
        { id: 'fuzz-prd-lead', dept: 'product', cls: 'internal' },
        { id: 'fuzz-mkt-lead', dept: 'marketing', cls: 'public-marketing' },
        { id: 'fuzz-eng-lead', dept: 'development', cls: 'private-engineering' },
      ];

      for (let i = 0; i < 120; i++) {
        const taskId = `TASK-FUZZ-${String(i).padStart(3, '0')}`;
        const agent = agents[Math.floor(rand() * agents.length)];
        if (!agent) throw new Error('Expected agent');
        const stage = rand() < 0.5 ? 'level-3' : 'level-1';
        const hopCount = Math.floor(rand() * 5); // 0..4
        const briefRel = `projects/fuzz/${agent.dept}/${taskId}.md`;

        fs.writeFileSync(
          path.join(tmp, briefRel),
          `---\ndoc_id: ${taskId}\nproject_id: fuzz\ndepartment: ${agent.dept}\ndoc_type: task-brief\nowner: ${agent.id}\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: medium\nhop_count: ${hopCount}\nmax_hops: 4\napproval_stage: ${stage}\naccess_classification: ${agent.cls}\nsources:\n  - projects/fuzz/development/internal-notes.md\n---\n# ${taskId}\n`,
        );

        // Context isolation invariant
        const env = buildContext({
          rootDir: tmp,
          projectId: 'fuzz',
          agentId: agent.id,
          briefSources: ['projects/fuzz/development/internal-notes.md'],
          maxTotalChars: 4000,
        });
        const totalChars = env.files.reduce((sum, f) => sum + f.content.length, 0);
        assert.ok(totalChars <= 4000, 'token budget exceeded');
        if (agent.cls !== 'private-engineering') {
          assert.ok(
            !env.files.some((f) => f.path.includes('internal-notes.md')),
            `classification leak for ${agent.cls}`,
          );
        }

        // Dispatch
        let dispatched = false;
        try {
          dispatchTask({ rootDir: tmp, briefPath: briefRel });
          dispatched = true;
        } catch (err) {
          assert.ok(err instanceof CircuitBreakerError);
          assert.equal(hopCount >= 4, true);
        }
        if (!dispatched) continue;

        // Random retries (0..3) including 3rd-retry escalation
        const retries = Math.floor(rand() * 4);
        let escalatedByRetry = false;
        for (let r = 0; r < retries; r++) {
          try {
            retryTask({
              rootDir: tmp,
              briefPath: briefRel,
              failureClass: 'tool',
              summary: `fuzz retry ${r + 1}`,
            });
          } catch (err) {
            assert.ok(err instanceof CircuitBreakerError && err.breaker === 'max_step_retries');
            escalatedByRetry = true;
            break;
          }
        }
        if (escalatedByRetry) continue;

        // Complete or multi-hop handoff
        const actionRoll = rand();
        if (actionRoll < 0.3) {
          const target = agents[Math.floor(rand() * agents.length)];
          if (!target) throw new Error('Expected target agent');
          try {
            completeTask({
              rootDir: tmp,
              briefPath: briefRel,
              result: {
                status: 'handoff',
                summary: 'Fuzz handoff',
                evidence: ['projects/fuzz/project-context.md'],
                handoff: { to_agent: target.id, reason: 'Next step', deliverables: ['summary.md'] },
              },
            });
            // Resume handoff on target agent
            const resumed = dispatchTask({ rootDir: tmp, briefPath: briefRel });
            assert.equal(resumed.owner, target.id);
          } catch (err) {
            assert.ok(
              err instanceof CircuitBreakerError &&
                (err.breaker === 'max_handoff_hops' || err.breaker === 'max_step_retries'),
            );
          }
        } else {
          const comp = completeTask({
            rootDir: tmp,
            briefPath: briefRel,
            result:
              stage === 'level-3'
                ? {
                    status: 'needs_approval',
                    summary: 'Needs Director',
                    evidence: ['npm test passed'],
                    approval_request: {
                      action_type: 'Release',
                      target: 'fuzz',
                      reason: 'Ready',
                      risks: 'Low',
                      rollback_plan: 'Revert',
                    },
                  }
                : { status: 'completed', summary: 'Done', evidence: ['npm test passed'] },
          });

          if (stage === 'level-3') {
            assert.equal(comp.status, 'paused_for_approval');
            approveTask({
              rootDir: tmp,
              taskId,
              decision: rand() < 0.7 ? 'approved' : 'rejected',
              notes: 'Fuzz decision',
            });
          } else {
            assert.equal(comp.status, 'completed');
          }
        }
      }

      // Verify entire ledger obeys ALLOWED_LEDGER_TRANSITIONS & Level 3 non-bypassability
      const events = readLedger(getLedgerPath(tmp));
      const lastState = new Map<string, string>();
      for (const ev of events) {
        const prev = (lastState.get(ev.task_id) ?? 'none') as keyof typeof ALLOWED_LEDGER_TRANSITIONS;
        assert.ok(
          ALLOWED_LEDGER_TRANSITIONS[prev].includes(ev.status),
          `Invalid transition ${prev} -> ${ev.status} for ${ev.task_id}`,
        );
        assert.ok(ev.retry_count <= 2, `retry_count ${ev.retry_count} exceeded 2`);
        lastState.set(ev.task_id, ev.status);
      }
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('prevents duplicate concurrent dispatches via withLedgerLock', async () => {
    const tmp = setupFuzzRepo();
    try {
      const briefRel = 'projects/fuzz/product/TASK-CONC-001.md';
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: TASK-CONC-001\nproject_id: fuzz\ndepartment: product\ndoc_type: task-brief\nowner: fuzz-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: high\nhop_count: 1\nmax_hops: 4\napproval_stage: level-1\naccess_classification: internal\nsources: []\n---\n# Concurrency\n`,
      );

      const results = await Promise.allSettled([
        Promise.resolve().then(() => dispatchTask({ rootDir: tmp, briefPath: briefRel })),
        Promise.resolve().then(() => dispatchTask({ rootDir: tmp, briefPath: briefRel })),
        Promise.resolve().then(() => dispatchTask({ rootDir: tmp, briefPath: briefRel })),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');
      assert.equal(fulfilled.length, 1);
      assert.equal(rejected.length, 2);

      const events = readLedger(getLedgerPath(tmp));
      assert.equal(events.filter((e) => e.status === 'dispatched').length, 1);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
