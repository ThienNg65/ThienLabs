import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { approveTask, completeTask, dispatchTask, getLedgerPath } from '../dispatch.js';
import { readLedger } from '../ledger.js';

describe('Antigravity dispatch -> complete -> approve lifecycle', () => {
  it('supports dry-run dispatch on Ferry PILOT-001-task-brief.md without mutating ledger', () => {
    const out = dispatchTask({
      rootDir: process.cwd(),
      briefPath: 'projects/ferry/product/PILOT-001-task-brief.md',
      dryRun: true,
    });
    assert.equal(out.dry_run, true);
    assert.equal(out.provider, 'antigravity');
    assert.equal(out.task_id, 'TASK-FERRY-001');
    assert.equal(out.owner, 'ferry-prd-lead');
    assert.equal(out.approval_stage, 'level-3');
    assert.ok(out.prompt.includes('BEGIN UNTRUSTED CONTEXT DATA'));
  });

  it('executes full dispatch -> Level 3 pause -> Director approve flow in isolated temp repo', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-disp-'));
    try {
      fs.mkdirSync(path.join(tmp, 'organization'), { recursive: true });
      fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'product'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'organization', 'project-registry.md'),
        `| \`project_id\` | Name | Status | Context Path | Authorized External Repositories |\n|---|---|---|---|---|\n| \`demo\` | Demo | \`active\` | [project-context.md](../projects/demo/project-context.md) | None |\n## Rules\n`,
      );
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'project-context.md'),
        `---\nstatus: active\naccess_classification: internal\n---\n# Demo\n`,
      );
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'product', 'lead.md'),
        `---\nagent_id: demo-prd-lead\nname: Demo Product\nproject_id: demo\ndepartment: product\nrole: Lead\nreports_to: chief-of-staff\nstatus: active\naccess_classification: internal\npermissions:\n  read: [projects/demo/]\n  write: [projects/demo/product/]\n  execute: []\n  external_action: none\nprovider_policy: structured-specifications\n---\n`,
      );
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
          status: 'completed',
          summary: 'Ready for Director merge approval',
          evidence: ['npm test passed'],
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
});
