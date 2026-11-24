import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { approveTask, completeTask, dispatchTask, getLedgerPath, retryTask } from '../dispatch.js';
import { CircuitBreakerError, readLedger } from '../ledger.js';

function setupTempRepo(): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-disp-'));
  fs.mkdirSync(path.join(tmp, 'organization'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'product'), { recursive: true });
  fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'marketing'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, 'organization', 'project-registry.md'),
    `| \`project_id\` | Name | Status | Context Path | Authorized External Repositories |\n|---|---|---|---|---|\n| \`demo\` | Demo | \`active\` | [project-context.md](../projects/demo/project-context.md) | None |\n## Rules\n`,
  );
  fs.writeFileSync(
    path.join(tmp, 'projects', 'demo', 'project-context.md'),
    `---\ndoc_id: PRJ-DEMO-CTX\nproject_id: demo\ndepartment: orchestration\ndoc_type: project-context\nowner: chief-of-staff\nstatus: active\naccess_classification: internal\n---\n# Demo\n`,
  );
  fs.writeFileSync(
    path.join(tmp, 'projects', 'demo', 'product', 'lead.md'),
    `---\nagent_id: demo-prd-lead\nname: Demo Product\nproject_id: demo\ndepartment: product\nrole: Lead\nreports_to: chief-of-staff\nstatus: active\naccess_classification: internal\ntools: [filesystem-read]\npermissions:\n  read: [projects/demo/]\n  write: [projects/demo/product/]\n  execute: []\n  external_action: none\nprovider_policy: structured-specifications\n---\n`,
  );
  fs.writeFileSync(
    path.join(tmp, 'projects', 'demo', 'marketing', 'lead.md'),
    `---\nagent_id: demo-mkt-lead\nname: Demo Marketing\nproject_id: demo\ndepartment: marketing\nrole: Lead\nreports_to: chief-of-staff\nstatus: active\naccess_classification: public-marketing\ntools: [filesystem-read]\npermissions:\n  read: [projects/demo/]\n  write: [projects/demo/marketing/]\n  execute: []\n  external_action: none\nprovider_policy: research-and-copy\n---\n`,
  );
  return tmp;
}

describe('Antigravity dispatch -> complete -> approve lifecycle', () => {
  it('supports dry-run dispatch on an active brief without mutating ledger', () => {
    const tmp = setupTempRepo();
    try {
      const briefRel = 'projects/demo/product/TASK-DEMO-DRY.md';
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: TASK-DEMO-DRY\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: demo-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: high\nhop_count: 1\nmax_hops: 4\napproval_stage: level-3\naccess_classification: internal\nsources: []\n---\n# Demo Dry Run\n`,
      );
      const out = dispatchTask({ rootDir: tmp, briefPath: briefRel, dryRun: true });
      assert.equal(out.dry_run, true);
      assert.equal(out.provider, 'antigravity');
      assert.equal(out.task_id, 'TASK-DEMO-DRY');
      assert.equal(out.owner, 'demo-prd-lead');
      assert.equal(out.approval_stage, 'level-3');
      assert.ok(out.prompt.includes('BEGIN UNTRUSTED CONTEXT DATA'));
      assert.equal(fs.existsSync(getLedgerPath(tmp)), false);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('executes full dispatch -> Level 3 pause -> Director approve flow in isolated temp repo', () => {
    const tmp = setupTempRepo();
    try {
      const briefRel = 'projects/demo/product/TASK-DEMO-001.md';
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: TASK-DEMO-001\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: demo-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: high\nhop_count: 1\nmax_hops: 4\napproval_stage: level-3\naccess_classification: internal\nsources: []\n---\n# Demo Task\n`,
      );

      const disp = dispatchTask({ rootDir: tmp, briefPath: briefRel });
      assert.equal(disp.dry_run, false);

      const comp = completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: {
          status: 'needs_approval',
          summary: 'Ready for Director merge approval',
          evidence: ['npm test passed'],
          approval_request: {
            action_type: 'PR merge',
            target: 'demo/main',
            reason: 'All checks passed',
            risks: 'Low risk',
            rollback_plan: 'git revert',
          },
        },
      });
      assert.equal(comp.status, 'paused_for_approval');
      assert.ok(comp.approvalFile && fs.existsSync(comp.approvalFile));

      const appr = approveTask({
        rootDir: tmp,
        taskId: 'TASK-DEMO-001',
        decision: 'approved',
        notes: 'LGTM',
      });
      assert.equal(appr.status, 'approved');

      const events = readLedger(getLedgerPath(tmp));
      assert.deepEqual(
        events.map((e) => e.status),
        ['dispatched', 'paused_for_approval', 'approved'],
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('emits HND-*.md on handoff and enforces retryTask circuit breaker', () => {
    const tmp = setupTempRepo();
    try {
      const briefRel = 'projects/demo/product/TASK-DEMO-002.md';
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: TASK-DEMO-002\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: demo-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: medium\nhop_count: 1\nmax_hops: 4\napproval_stage: level-1\naccess_classification: internal\nsources: []\n---\n# Handoff & Retry\n`,
      );

      dispatchTask({ rootDir: tmp, briefPath: briefRel });
      const r1 = retryTask({ rootDir: tmp, briefPath: briefRel, failureClass: 'tool', summary: 'Retry 1' });
      assert.equal(r1.status, 'retried');

      const comp = completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: {
          status: 'handoff',
          summary: 'Passing spec to marketing',
          evidence: ['projects/demo/project-context.md'],
          handoff: {
            to_agent: 'demo-mkt-lead',
            reason: 'Draft launch copy',
            deliverables: ['launch-copy.md'],
          },
        },
      });
      assert.equal(comp.status, 'handoff');
      assert.ok(comp.handoffFile && fs.existsSync(comp.handoffFile));

      // Resume handoff via dispatchTask -> should route to demo-mkt-lead at hop_count 2
      const resumed = dispatchTask({ rootDir: tmp, briefPath: briefRel });
      assert.equal(resumed.owner, 'demo-mkt-lead');
      assert.ok(resumed.loaded_files.some((f) => f.path.endsWith('HND-TASK-DEMO-002-H2.md')));

      const finalComp = completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: { status: 'completed', summary: 'Marketing completed', evidence: ['launch-copy.md'] },
      });
      assert.equal(finalComp.status, 'completed');

      // Verify 3rd retry throws CircuitBreakerError when active
      const brief3Rel = 'projects/demo/product/TASK-DEMO-002B.md';
      fs.writeFileSync(
        path.join(tmp, brief3Rel),
        `---\ndoc_id: TASK-DEMO-002B\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: demo-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: medium\nhop_count: 1\nmax_hops: 4\napproval_stage: level-1\naccess_classification: internal\nsources: []\n---\n# Retry Breaker\n`,
      );
      dispatchTask({ rootDir: tmp, briefPath: brief3Rel });
      retryTask({ rootDir: tmp, briefPath: brief3Rel, failureClass: 'tool', summary: 'R1' });
      retryTask({ rootDir: tmp, briefPath: brief3Rel, failureClass: 'tool', summary: 'R2' });
      assert.throws(
        () => retryTask({ rootDir: tmp, briefPath: brief3Rel, failureClass: 'tool', summary: 'R3' }),
        (err: unknown) => err instanceof CircuitBreakerError && err.breaker === 'max_step_retries',
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('escalates when handoff would reach max_hops', () => {
    const tmp = setupTempRepo();
    try {
      const briefRel = 'projects/demo/product/TASK-DEMO-003.md';
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: TASK-DEMO-003\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: demo-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: medium\nhop_count: 3\nmax_hops: 4\napproval_stage: level-1\naccess_classification: internal\nsources: []\n---\n# Hop Limit\n`,
      );
      dispatchTask({ rootDir: tmp, briefPath: briefRel });
      assert.throws(
        () =>
          completeTask({
            rootDir: tmp,
            briefPath: briefRel,
            result: {
              status: 'handoff',
              summary: 'Exceeds max hops',
              evidence: ['projects/demo/project-context.md'],
              handoff: { to_agent: 'demo-mkt-lead', reason: 'Too many hops', deliverables: [] },
            },
          }),
        (err: unknown) => err instanceof CircuitBreakerError && err.breaker === 'max_handoff_hops',
      );
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
