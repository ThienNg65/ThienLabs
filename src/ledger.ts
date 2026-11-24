import fs from 'node:fs';
import path from 'node:path';
import type { AgentContract, ExecutionResult, FailureClass, TaskBrief } from './contracts.js';

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
  handoff_to?: string;
  handoff_file?: string;
  failure_class?: FailureClass;
}

export const ALLOWED_LEDGER_TRANSITIONS: Record<LedgerStatus | 'none', readonly LedgerStatus[]> = {
  none: ['dispatched', 'escalated', 'blocked'],
  dispatched: ['completed', 'handoff', 'paused_for_approval', 'retried', 'blocked', 'failed', 'escalated'],
  handoff: ['dispatched', 'escalated', 'blocked'],
  retried: ['completed', 'handoff', 'paused_for_approval', 'retried', 'blocked', 'failed', 'escalated'],
  failed: ['dispatched', 'escalated'],
  paused_for_approval: ['approved', 'rejected'],
  completed: [],
  approved: ['dispatched'],
  rejected: [],
  blocked: [],
  escalated: [],
};

export function assertValidTransition(
  fromStatus: LedgerStatus | 'none',
  toStatus: LedgerStatus,
  taskId: string,
): void {
  const allowed = ALLOWED_LEDGER_TRANSITIONS[fromStatus];
  if (!allowed.includes(toStatus)) {
    throw new Error(
      `Invalid ledger transition for '${taskId}': '${fromStatus}' -> '${toStatus}' (allowed: ${allowed.join(', ') || 'none'})`,
    );
  }
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

/** Acquires an exclusive advisory lockfile around ledger mutations. */
export function withLedgerLock<T>(ledgerPath: string, fn: () => T): T {
  const dir = path.dirname(ledgerPath);
  fs.mkdirSync(dir, { recursive: true });
  const lockPath = `${ledgerPath}.lock`;
  const deadline = Date.now() + 5000;
  const sleepSignal = new Int32Array(new SharedArrayBuffer(4));
  let fd: number | null = null;

  while (fd === null) {
    try {
      fd = fs.openSync(lockPath, 'wx');
      fs.writeFileSync(fd, `${process.pid}\n${Date.now()}\n`, 'utf8');
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code !== 'EEXIST') throw err;
      try {
        const stat = fs.statSync(lockPath);
        if (Date.now() - stat.mtimeMs > 10_000) {
          fs.unlinkSync(lockPath);
          continue;
        }
      } catch (statErr) {
        const statCode = (statErr as NodeJS.ErrnoException).code;
        if (statCode === 'ENOENT') continue;
      }
      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for ledger lock: ${lockPath}`);
      }
      Atomics.wait(sleepSignal, 0, 0, 10);
    }
  }

  try {
    return fn();
  } finally {
    try {
      fs.closeSync(fd);
    } catch {
      // ignore close errors
    }
    try {
      fs.unlinkSync(lockPath);
    } catch {
      // ignore unlink errors
    }
  }
}

function parseLedgerEvent(raw: unknown, lineNum: number): LedgerEvent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(`Ledger line ${lineNum}: expected JSON object`);
  }
  const obj = raw as Record<string, unknown>;
  if (
    typeof obj.task_id !== 'string' ||
    !obj.task_id ||
    typeof obj.status !== 'string' ||
    !(obj.status in ALLOWED_LEDGER_TRANSITIONS) ||
    obj.status === 'none'
  ) {
    throw new Error(`Ledger line ${lineNum}: invalid task_id or status`);
  }
  return {
    timestamp: String(obj.timestamp ?? ''),
    task_id: obj.task_id,
    project_id: String(obj.project_id ?? ''),
    owner_agent: String(obj.owner_agent ?? ''),
    provider: String(obj.provider ?? ''),
    model: typeof obj.model === 'string' ? obj.model : undefined,
    hop_count: Number(obj.hop_count ?? 0),
    retry_count: Number(obj.retry_count ?? 0),
    status: obj.status as LedgerStatus,
    summary: typeof obj.summary === 'string' ? obj.summary : undefined,
    evidence: Array.isArray(obj.evidence) ? obj.evidence.map(String) : undefined,
    approval_file: typeof obj.approval_file === 'string' ? obj.approval_file : undefined,
    handoff_to: typeof obj.handoff_to === 'string' ? obj.handoff_to : undefined,
    handoff_file: typeof obj.handoff_file === 'string' ? obj.handoff_file : undefined,
    failure_class: typeof obj.failure_class === 'string' ? (obj.failure_class as FailureClass) : undefined,
  };
}

/** Reads and validates all events from the append-only JSONL ledger. */
export function readLedger(ledgerPath: string): LedgerEvent[] {
  if (!fs.existsSync(ledgerPath)) return [];
  const raw = fs.readFileSync(ledgerPath, 'utf8');
  const events: LedgerEvent[] = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const trimmed = (lines[i] ?? '').trim();
    if (!trimmed) continue;
    events.push(parseLedgerEvent(JSON.parse(trimmed), i + 1));
  }
  return events;
}

function appendLedgerEvent(ledgerPath: string, event: LedgerEvent): void {
  fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
  fs.appendFileSync(ledgerPath, JSON.stringify(event) + '\n', 'utf8');
}

/** Validates state-machine transition and appends an event to the ledger. */
export function recordLedgerTransition(ledgerPath: string, event: LedgerEvent): void {
  const events = readLedger(ledgerPath);
  const latest = getLatestTaskState(events, event.task_id);
  assertValidTransition(latest?.status ?? 'none', event.status, event.task_id);
  appendLedgerEvent(ledgerPath, event);
}

export function getLatestTaskState(events: LedgerEvent[], taskId: string): LedgerEvent | undefined {
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (ev && ev.task_id === taskId) return ev;
  }
  return undefined;
}

/** Verifies duplicate-task, hop-limit, and retry-limit circuit breakers before dispatch. */
export function assertCanDispatch(
  events: LedgerEvent[],
  brief: TaskBrief,
  hopCountOverride?: number,
): { retryCount: number } {
  const latest = getLatestTaskState(events, brief.doc_id);
  if (latest && (latest.status === 'dispatched' || latest.status === 'paused_for_approval')) {
    throw new CircuitBreakerError(
      'duplicate_task',
      `Task '${brief.doc_id}' is already '${latest.status}' (owner: ${latest.owner_agent})`,
    );
  }

  const hopCount = hopCountOverride ?? brief.hop_count;
  const maxHops = brief.max_hops || 4;
  if (hopCount >= maxHops) {
    throw new CircuitBreakerError(
      'max_handoff_hops',
      `Task '${brief.doc_id}' reached hop_count=${hopCount} (max_hops=${maxHops}); escalate to Director/Chief of Staff`,
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
  const approvalTag = `[TL-APR:${aprId}]`;
  const taskPhase = brief.workflow_phase ?? 'implementation';
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
workflow_phase: director-approval
origin_phase: ${taskPhase}
github_approval_marker: "${approvalTag}"
required_labels:
  - phase:director-approval
  - approval:required
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

## GitHub Approval Controls
- **Visible phase marker:** [FERRY:DIRECTOR-APPROVAL] (GitHub label: phase:director-approval)
- **Workflow phase:** director-approval
- **Approval ID:** ${aprId}
- **Approval marker:** ${approvalTag}
- **Required labels:** phase:director-approval, approval:required
- **PR title:** Keep the repository's Conventional Commit format; place approval metadata in the PR body, not the title.
- **Approve comment:** /approve ${aprId} or APPROVED: ${aprId}
- **Reject comment:** /reject ${aprId} or REJECTED: ${aprId}
- A GitHub APPROVED review counts only when submitted by the repository owner on this exact tagged item while approval:required is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director decision.
`;

  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}

export function emitHandoffDocument(options: {
  rootDir: string;
  brief: TaskBrief;
  fromAgent: string;
  toAgent: AgentContract;
  result: ExecutionResult;
}): string {
  const { rootDir, brief, fromAgent, toAgent, result } = options;
  if (!result.handoff) {
    throw new Error('emitHandoffDocument requires result.handoff');
  }
  const today = new Date().toISOString().slice(0, 10);
  const nextHop = brief.hop_count + 1;
  const hndId = `HND-${brief.doc_id}-H${nextHop}`;
  const outPath = path.join(rootDir, 'projects', brief.project_id, toAgent.department, `${hndId}.md`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const sourceLines =
    result.evidence.length > 0 ? result.evidence.map((e) => `  - ${JSON.stringify(e)}`).join('\n') : '';
  const evidenceBullets =
    result.evidence.length > 0 ? result.evidence.map((e) => `- \`${e}\``).join('\n') : '- None reported';
  const deliverableBullets =
    result.handoff.deliverables.length > 0
      ? result.handoff.deliverables.map((d) => `- ${d}`).join('\n')
      : '- See summary';

  const content = `---
doc_id: ${hndId}
project_id: ${brief.project_id}
department: ${brief.department}-to-${toAgent.department}
doc_type: cross-department-handoff
from_agent: ${fromAgent}
to_agent: ${toAgent.agent_id}
related_task_id: ${brief.doc_id}
hop_count: ${nextHop}
max_hops: ${brief.max_hops}
status: open
version: "1.0"
access_classification: ${toAgent.access_classification}
sources:${sourceLines ? '\n' + sourceLines : ' []'}
supersedes: null
created_at: "${today}"
updated_at: "${today}"
---

# Cross-Department Handoff: ${brief.doc_id} (Hop ${nextHop})

## Purpose & Ownership Transfer
- **Purpose:** ${result.handoff.reason}
- **Ownership transfer:** \`${fromAgent}\` → \`${toAgent.agent_id}\`

## Context Envelope (Synthesized Brief)
- ${result.summary}

## Cited Sources & Evidence
${evidenceBullets}

## Required Action & Expected Deliverable
- **Action needed:** ${result.handoff.reason}
- **Expected deliverables:**
${deliverableBullets}
`;

  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}
