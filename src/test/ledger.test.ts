import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import type { TaskBrief } from '../contracts.js';
import {
  CircuitBreakerError,
  assertCanDispatch,
  emitApprovalRequest,
  readLedger,
  recordLedgerTransition,
} from '../ledger.js';

const baseBrief: TaskBrief = {
  doc_id: 'TASK-FERRY-999',
  project_id: 'ferry',
  department: 'product',
  doc_type: 'task-brief',
  owner: 'ferry-prd-lead',
  created_by: 'org-chief-of-staff',
  parent_task_id: null,
  status: 'active',
  priority: 'medium',
  hop_count: 1,
  max_hops: 4,
  approval_stage: 'level-3',
  access_classification: 'public-marketing',
  sources: [],
};

describe('ledger circuit breakers & approval gates', () => {
  it('blocks dispatch when hop_count >= max_hops', () => {
    assert.throws(
      () => assertCanDispatch([], { ...baseBrief, hop_count: 4 }),
      (err: unknown) => err instanceof CircuitBreakerError && err.breaker === 'max_handoff_hops',
    );
  });

  it('blocks dispatch after 2 failed/retried attempts', () => {
    const events = [
      {
        timestamp: '2026-11-23T00:00:00Z',
        task_id: 'TASK-FERRY-999',
        project_id: 'ferry',
        owner_agent: 'ferry-prd-lead',
        provider: 'gemini',
        hop_count: 1,
        retry_count: 1,
        status: 'failed' as const,
      },
      {
        timestamp: '2026-11-23T00:01:00Z',
        task_id: 'TASK-FERRY-999',
        project_id: 'ferry',
        owner_agent: 'ferry-prd-lead',
        provider: 'gemini',
        hop_count: 1,
        retry_count: 2,
        status: 'failed' as const,
      },
    ];
    assert.throws(
      () => assertCanDispatch(events, baseBrief),
      (err: unknown) => err instanceof CircuitBreakerError && err.breaker === 'max_step_retries',
    );
  });

  it('blocks duplicate active tasks and writes Level 3 approval artifact', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-ldg-'));
    try {
      const ledgerPath = path.join(tmp, 'runtime', 'ledger.jsonl');
      recordLedgerTransition(ledgerPath, {
        timestamp: '2026-11-23T00:00:00Z',
        task_id: 'TASK-FERRY-999',
        project_id: 'ferry',
        owner_agent: 'ferry-prd-lead',
        provider: 'gemini',
        hop_count: 1,
        retry_count: 0,
        status: 'dispatched',
      });
      recordLedgerTransition(ledgerPath, {
        timestamp: '2026-11-23T00:01:00Z',
        task_id: 'TASK-FERRY-999',
        project_id: 'ferry',
        owner_agent: 'ferry-prd-lead',
        provider: 'gemini',
        hop_count: 1,
        retry_count: 0,
        status: 'paused_for_approval',
      });
      const loaded = readLedger(ledgerPath);
      assert.equal(loaded.length, 2);

      assert.throws(
        () => assertCanDispatch(loaded, baseBrief),
        (err: unknown) => err instanceof CircuitBreakerError && err.breaker === 'duplicate_task',
      );

      const aprPath = emitApprovalRequest({
        rootDir: tmp,
        brief: baseBrief,
        agentId: 'ferry-prd-lead',
        result: {
          status: 'needs_approval',
          summary: 'Ready to merge PR',
          evidence: ['npm test passed'],
        },
      });
      assert.ok(fs.existsSync(aprPath));
      const aprText = fs.readFileSync(aprPath, 'utf8');
      assert.ok(aprText.includes('doc_id: APR-TASK-FERRY-999'));
      assert.ok(aprText.includes('npm test passed'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
