import fs from 'node:fs';
import path from 'node:path';
import type { ExecutionResult, TaskBrief } from './contracts.js';

export type LedgerStatus =
  | 'dispatched'
  | 'completed'
  | 'handoff'
  | 'retried'
  | 'escalated'
  | 'paused_for_approval'
  | 'approved'
  | 'rejected'
  | 'blocked'
  | 'failed';

export interface LedgerEvent {
  timestamp: string;
  task_id: string;
  project_id: string;
  owner_agent: string;
  provider: string;
  model?: string;
  hop_count: number;
  retry_count: number;
  status: LedgerStatus;
  summary?: string;
  evidence?: string[];
  approval_file?: string;
}

export class CircuitBreakerError extends Error {
  constructor(
    public readonly breaker: 'duplicate_task' | 'max_handoff_hops' | 'max_step_retries',
    message: string,
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

export function readLedger(ledgerPath: string): LedgerEvent[] {
  if (!fs.existsSync(ledgerPath)) return [];
  const raw = fs.readFileSync(ledgerPath, 'utf8');
  const events: LedgerEvent[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    events.push(JSON.parse(trimmed) as LedgerEvent);
  }
  return events;
}

export function appendLedgerEvent(ledgerPath: string, event: LedgerEvent): void {
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, JSON.stringify(event) + '\n', 'utf8');
}

export function getLatestTaskState(events: LedgerEvent[], taskId: string): LedgerEvent | undefined {
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (ev && ev.task_id === taskId) return ev;
  }
  return undefined;
}

export function assertCanDispatch(events: LedgerEvent[], brief: TaskBrief): { retryCount: number } {
  const latest = getLatestTaskState(events, brief.doc_id);
  if (latest && (latest.status === 'dispatched' || latest.status === 'paused_for_approval')) {
    throw new CircuitBreakerError(
      'duplicate_task',
      `Task '${brief.doc_id}' is already '${latest.status}' (owner: ${latest.owner_agent})`,
    );
  }

  const maxHops = brief.max_hops || 4;
  if (brief.hop_count >= maxHops) {
    throw new CircuitBreakerError(
      'max_handoff_hops',
      `Task '${brief.doc_id}' reached hop_count=${brief.hop_count} (max_hops=${maxHops}); escalate to Director/Chief of Staff`,
    );
  }

  const retryCount = events.filter(
    (e) => e.task_id === brief.doc_id && (e.status === 'retried' || e.status === 'failed'),
  ).length;
  if (retryCount >= 2) {
    throw new CircuitBreakerError(
      'max_step_retries',
      `Task '${brief.doc_id}' reached max_step_retries (${retryCount}/2); halt and replan`,
    );
  }

  return { retryCount };
}

export function emitApprovalRequest(options: {
  rootDir: string;
  brief: TaskBrief;
  agentId: string;
  result: ExecutionResult;
}): string {
  const { rootDir, brief, agentId, result } = options;
  const today = new Date().toISOString().slice(0, 10);
  const aprId = `APR-${brief.doc_id}`;
  const outPath = path.join(rootDir, 'projects', brief.project_id, 'decisions', `${aprId}.md`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const req = result.approval_request;
  const actionType = req?.action_type ?? 'Level 3 Director Approval';
  const target = req?.target ?? brief.doc_id;
  const reason = req?.reason ?? result.summary;
  const risks = req?.risks ?? 'Requires Director review before proceeding.';
  const rollback = req?.rollback_plan ?? 'No external state modified; reject request to cancel.';
  const evidenceLines =
    result.evidence.length > 0 ? result.evidence.map((e) => `- ${e}`).join('\n') : '- None reported';

  const content = `---
doc_id: ${aprId}
project_id: ${brief.project_id}
department: ${brief.department}
doc_type: approval-request
requested_by: ${agentId}
related_task_id: ${brief.doc_id}
status: pending
version: "1.0"
access_classification: ${brief.access_classification}
sources: []
supersedes: null
created_at: "${today}"
updated_at: "${today}"
---

# Director Approval Request: ${brief.doc_id}

## Proposed Action & Exact Scope
- **Action type:** ${actionType}
- **Target:** ${target}
- **Reason:** ${reason}

## Expected Impact & Risks
- ${risks}

## Validation Evidence
${evidenceLines}

## Rollback Plan
- ${rollback}

## Alternatives & Recommendation
- **Recommendation:** Review evidence and approve or reject via \`thienlabs approve --task ${brief.doc_id}\`.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director decision.
`;

  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}
