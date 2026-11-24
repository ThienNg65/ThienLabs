export type ClassificationTier =
  | 'public'
  | 'public-marketing'
  | 'public-release'
  | 'internal'
  | 'private-engineering'
  | 'restricted';

const CLASSIFICATION_RANK: Record<ClassificationTier, number> = {
  public: 0,
  'public-marketing': 0,
  'public-release': 0,
  internal: 1,
  'private-engineering': 2,
  restricted: 3,
};

export function isClassificationTier(value: unknown): value is ClassificationTier {
  return typeof value === 'string' && value in CLASSIFICATION_RANK;
}

export function classificationRank(tier: ClassificationTier): number {
  return CLASSIFICATION_RANK[tier];
}

export const DEPARTMENTS = [
  'orchestration',
  'marketing',
  'product',
  'development',
  'education',
  'governance',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const AGENT_STATUSES = ['active', 'paused', 'deprecated'] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const ARTIFACT_STATUSES = [
  'draft',
  'proposed',
  'active',
  'paused',
  'open',
  'completed',
  'accepted',
  'pending',
  'approved',
  'rejected',
  'superseded',
  'deprecated',
] as const;
export type ArtifactStatus = (typeof ARTIFACT_STATUSES)[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const APPROVAL_STAGES = ['level-1', 'level-2', 'level-3'] as const;
export type ApprovalStage = (typeof APPROVAL_STAGES)[number];

export const WORKFLOW_PHASES = [
  'intake',
  'discovery',
  'implementation',
  'qa',
  'director-approval',
  'release',
] as const;
export type WorkflowPhase = (typeof WORKFLOW_PHASES)[number];

export const FAILURE_CLASSES = ['provider', 'tool', 'permission', 'context', 'ambiguity'] as const;
export type FailureClass = (typeof FAILURE_CLASSES)[number];

export interface ValidationIssue {
  code: string;
  file: string;
  rule: string;
  message: string;
  fixHint: string;
}

export interface AgentPermissions {
  read: string[];
  write: string[];
  execute: string[];
  external_action: string;
}

export interface AgentContract {
  agent_id: string;
  name: string;
  project_id: string;
  department: Department;
  role: string;
  reports_to: string;
  status: AgentStatus;
  version?: string;
  access_classification: ClassificationTier;
  tools: string[];
  permissions: AgentPermissions;
  provider_policy: string;
}

export interface TaskBrief {
  doc_id: string;
  project_id: string;
  department: Department;
  doc_type: 'task-brief';
  owner: string;
  created_by: string;
  parent_task_id: string | null;
  status: ArtifactStatus;
  priority: TaskPriority;
  hop_count: number;
  max_hops: number;
  approval_stage: ApprovalStage;
  workflow_phase?: WorkflowPhase;
  version?: string;
  access_classification: ClassificationTier;
  sources: string[];
  supersedes?: string | null;
}

export interface CrossDepartmentHandoff {
  doc_id: string;
  project_id: string;
  department: string;
  doc_type: 'cross-department-handoff';
  from_agent: string;
  to_agent: string;
  related_task_id: string;
  hop_count: number;
  max_hops: number;
  status: ArtifactStatus;
  version?: string;
  access_classification: ClassificationTier;
  sources: string[];
  supersedes?: string | null;
}

export interface ApprovalRequestDoc {
  doc_id: string;
  project_id: string;
  department: Department;
  doc_type: 'approval-request';
  requested_by: string;
  related_task_id: string;
  status: 'pending' | 'approved' | 'rejected';
  version?: string;
  access_classification: ClassificationTier;
  sources: string[];
  supersedes?: string | null;
}

export interface QualityAuditReport {
  doc_id: string;
  project_id: string;
  department: 'education';
  doc_type: 'quality-audit-report';
  owner: string;
  status: ArtifactStatus;
  version?: string;
  access_classification: ClassificationTier;
  sources: string[];
  supersedes?: string | null;
}

export interface GovernanceDoc {
  doc_id: string;
  project_id: string;
  department: Department;
  doc_type: string;
  owner: string;
  status: ArtifactStatus;
  version?: string;
  access_classification: ClassificationTier;
}

export interface ExternalRepoEntry {
  localPath: string;
  classification: ClassificationTier;
}

export interface ProjectRegistryEntry {
  project_id: string;
  name: string;
  status: string;
  context_path: string;
  external_repos: ExternalRepoEntry[];
}

export interface ExecutionResult {
  status: 'completed' | 'handoff' | 'blocked' | 'needs_approval';
  summary: string;
  evidence: string[];
  handoff?: {
    to_agent: string;
    reason: string;
    deliverables: string[];
  };
  approval_request?: {
    action_type: string;
    target: string;
    reason: string;
    risks: string;
    rollback_plan: string;
  };
}

export const EXECUTION_RESULT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['completed', 'handoff', 'blocked', 'needs_approval'],
    },
    summary: { type: 'string' },
    evidence: {
      type: 'array',
      items: { type: 'string' },
    },
    handoff: {
      type: 'object',
      properties: {
        to_agent: { type: 'string' },
        reason: { type: 'string' },
        deliverables: { type: 'array', items: { type: 'string' } },
      },
      required: ['to_agent', 'reason', 'deliverables'],
    },
    approval_request: {
      type: 'object',
      properties: {
        action_type: { type: 'string' },
        target: { type: 'string' },
        reason: { type: 'string' },
        risks: { type: 'string' },
        rollback_plan: { type: 'string' },
      },
      required: ['action_type', 'target', 'reason', 'risks', 'rollback_plan'],
    },
  },
  required: ['status', 'summary', 'evidence'],
};

function requireString(data: Record<string, unknown>, key: string, filePath: string): string {
  const val = data[key];
  if (typeof val !== 'string' || !val.trim()) {
    throw new Error(`${filePath}: missing or invalid string field '${key}'`);
  }
  return val.trim();
}

function optionalNullableString(data: Record<string, unknown>, key: string): string | null | undefined {
  const val = data[key];
  if (val === undefined || val === null) return val;
  return String(val);
}

function requireStringArray(value: unknown, field: string, filePath: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${filePath}: '${field}' must be an array of strings`);
  }
  return value.map((item) => String(item));
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  filePath: string,
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new Error(`${filePath}: invalid ${field} '${String(value)}' (expected ${allowed.join(' | ')})`);
  }
  return value as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

/** Validates YAML frontmatter against the AgentContract schema. */
export function assertAgentContract(data: Record<string, unknown>, filePath: string): AgentContract {
  const agentId = requireString(data, 'agent_id', filePath);
  const name = requireString(data, 'name', filePath);
  const projectId = requireString(data, 'project_id', filePath);
  const department = requireEnum(data.department, DEPARTMENTS, 'department', filePath);
  const role = requireString(data, 'role', filePath);
  const reportsTo = requireString(data, 'reports_to', filePath);
  const status = requireEnum(data.status, AGENT_STATUSES, 'status', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }
  const tools = requireStringArray(data.tools, 'tools', filePath);
  const providerPolicy = requireString(data, 'provider_policy', filePath);
  if (!isPlainObject(data.permissions)) {
    throw new Error(`${filePath}: permissions must be an object`);
  }
  const perms = data.permissions;
  const read = requireStringArray(perms.read, 'permissions.read', filePath);
  const write = requireStringArray(perms.write, 'permissions.write', filePath);
  const execute = requireStringArray(perms.execute, 'permissions.execute', filePath);
  if (typeof perms.external_action !== 'string') {
    throw new Error(`${filePath}: permissions.external_action must be a string`);
  }

  return {
    agent_id: agentId,
    name,
    project_id: projectId,
    department,
    role,
    reports_to: reportsTo,
    status,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
    tools,
    permissions: { read, write, execute, external_action: perms.external_action },
    provider_policy: providerPolicy,
  };
}

/** Validates YAML frontmatter against the TaskBrief schema. */
export function assertTaskBrief(data: Record<string, unknown>, filePath: string): TaskBrief {
  const docId = requireString(data, 'doc_id', filePath);
  const projectId = requireString(data, 'project_id', filePath);
  const department = requireEnum(data.department, DEPARTMENTS, 'department', filePath);
  if (data.doc_type !== 'task-brief') {
    throw new Error(`${filePath}: expected doc_type 'task-brief'`);
  }
  const owner = requireString(data, 'owner', filePath);
  const createdBy = requireString(data, 'created_by', filePath);
  const status = requireEnum(data.status, ARTIFACT_STATUSES, 'status', filePath);
  const priority = requireEnum(data.priority, TASK_PRIORITIES, 'priority', filePath);
  const approvalStage = requireEnum(data.approval_stage, APPROVAL_STAGES, 'approval_stage', filePath);
  const workflowPhase =
    data.workflow_phase === undefined
      ? undefined
      : requireEnum(data.workflow_phase, WORKFLOW_PHASES, 'workflow_phase', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }
  const hopCount = Number(data.hop_count ?? 0);
  const maxHops = Number(data.max_hops ?? 4);
  if (!Number.isInteger(hopCount) || hopCount < 0 || !Number.isInteger(maxHops) || maxHops < 1 || maxHops > 4) {
    throw new Error(`${filePath}: hop_count (>= 0) and max_hops (1..4) must be valid integers`);
  }

  return {
    doc_id: docId,
    project_id: projectId,
    department,
    doc_type: 'task-brief',
    owner,
    created_by: createdBy,
    parent_task_id: optionalNullableString(data, 'parent_task_id') ?? null,
    status,
    priority,
    hop_count: hopCount,
    max_hops: maxHops,
    approval_stage: approvalStage,
    workflow_phase: workflowPhase,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    supersedes: optionalNullableString(data, 'supersedes'),
  };
}

/** Validates YAML frontmatter against the CrossDepartmentHandoff schema. */
export function assertCrossDepartmentHandoff(
  data: Record<string, unknown>,
  filePath: string,
): CrossDepartmentHandoff {
  const docId = requireString(data, 'doc_id', filePath);
  if (!docId.startsWith('HND-')) {
    throw new Error(`${filePath}: cross-department-handoff doc_id must start with 'HND-'`);
  }
  const projectId = requireString(data, 'project_id', filePath);
  const department = requireString(data, 'department', filePath);
  if (data.doc_type !== 'cross-department-handoff') {
    throw new Error(`${filePath}: expected doc_type 'cross-department-handoff'`);
  }
  const fromAgent = requireString(data, 'from_agent', filePath);
  const toAgent = requireString(data, 'to_agent', filePath);
  const relatedTaskId = requireString(data, 'related_task_id', filePath);
  const status = requireEnum(data.status, ARTIFACT_STATUSES, 'status', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }
  const hopCount = Number(data.hop_count ?? 1);
  const maxHops = Number(data.max_hops ?? 4);
  if (!Number.isInteger(hopCount) || hopCount < 1 || !Number.isInteger(maxHops) || maxHops < 1 || maxHops > 4) {
    throw new Error(`${filePath}: hop_count (1..4) and max_hops (1..4) must be valid integers`);
  }

  return {
    doc_id: docId,
    project_id: projectId,
    department,
    doc_type: 'cross-department-handoff',
    from_agent: fromAgent,
    to_agent: toAgent,
    related_task_id: relatedTaskId,
    hop_count: hopCount,
    max_hops: maxHops,
    status,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    supersedes: optionalNullableString(data, 'supersedes'),
  };
}

/** Validates YAML frontmatter against the ApprovalRequestDoc schema. */
export function assertApprovalRequest(
  data: Record<string, unknown>,
  filePath: string,
): ApprovalRequestDoc {
  const docId = requireString(data, 'doc_id', filePath);
  if (!docId.startsWith('APR-')) {
    throw new Error(`${filePath}: approval-request doc_id must start with 'APR-'`);
  }
  const projectId = requireString(data, 'project_id', filePath);
  const department = requireEnum(data.department, DEPARTMENTS, 'department', filePath);
  if (data.doc_type !== 'approval-request') {
    throw new Error(`${filePath}: expected doc_type 'approval-request'`);
  }
  const requestedBy = requireString(data, 'requested_by', filePath);
  const relatedTaskId = requireString(data, 'related_task_id', filePath);
  const status = requireEnum(data.status, ['pending', 'approved', 'rejected'] as const, 'status', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }

  return {
    doc_id: docId,
    project_id: projectId,
    department,
    doc_type: 'approval-request',
    requested_by: requestedBy,
    related_task_id: relatedTaskId,
    status,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    supersedes: optionalNullableString(data, 'supersedes'),
  };
}

/** Validates YAML frontmatter against the QualityAuditReport schema. */
export function assertQualityAuditReport(
  data: Record<string, unknown>,
  filePath: string,
): QualityAuditReport {
  const docId = requireString(data, 'doc_id', filePath);
  if (!docId.startsWith('AUD-')) {
    throw new Error(`${filePath}: quality-audit-report doc_id must start with 'AUD-'`);
  }
  const projectId = requireString(data, 'project_id', filePath);
  if (data.doc_type !== 'quality-audit-report') {
    throw new Error(`${filePath}: expected doc_type 'quality-audit-report'`);
  }
  if (data.department !== 'education') {
    throw new Error(`${filePath}: quality-audit-report department must be 'education'`);
  }
  const owner = requireString(data, 'owner', filePath);
  const status = requireEnum(data.status, ARTIFACT_STATUSES, 'status', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }

  return {
    doc_id: docId,
    project_id: projectId,
    department: 'education',
    doc_type: 'quality-audit-report',
    owner,
    status,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    supersedes: optionalNullableString(data, 'supersedes'),
  };
}

/** Validates base YAML frontmatter for general governance and project documents. */
export function assertGovernanceDoc(
  data: Record<string, unknown>,
  filePath: string,
): GovernanceDoc {
  const docId = requireString(data, 'doc_id', filePath);
  const projectId = requireString(data, 'project_id', filePath);
  const department = requireEnum(data.department, DEPARTMENTS, 'department', filePath);
  const docType = requireString(data, 'doc_type', filePath);
  const owner = requireString(data, 'owner', filePath);
  const status = requireEnum(data.status, ARTIFACT_STATUSES, 'status', filePath);
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }

  return {
    doc_id: docId,
    project_id: projectId,
    department,
    doc_type: docType,
    owner,
    status,
    version: typeof data.version === 'string' ? data.version : undefined,
    access_classification: data.access_classification,
  };
}

/** Validates an ExecutionResult payload against EXECUTION_RESULT_SCHEMA and evidence rules. */
export function assertExecutionResult(raw: unknown): ExecutionResult {
  if (!isPlainObject(raw)) {
    throw new Error('ExecutionResult must be a JSON object matching EXECUTION_RESULT_SCHEMA');
  }
  const status = requireEnum(
    raw.status,
    ['completed', 'handoff', 'blocked', 'needs_approval'] as const,
    'ExecutionResult.status',
    '<result>',
  );
  if (typeof raw.summary !== 'string' || !raw.summary.trim()) {
    throw new Error('ExecutionResult.summary must be a non-empty string');
  }
  const evidence = requireStringArray(raw.evidence, 'ExecutionResult.evidence', '<result>');
  if (evidence.some((e) => !e.trim())) {
    throw new Error('ExecutionResult.evidence entries must be non-empty strings');
  }
  if ((status === 'completed' || status === 'needs_approval') && evidence.length === 0) {
    throw new Error(`ExecutionResult with status '${status}' requires at least one observed evidence entry`);
  }

  let handoff: ExecutionResult['handoff'];
  if (status === 'handoff') {
    if (!isPlainObject(raw.handoff)) {
      throw new Error("ExecutionResult with status 'handoff' requires handoff.{to_agent, reason, deliverables[]}");
    }
    const h = raw.handoff;
    handoff = {
      to_agent: requireString(h, 'to_agent', '<result>.handoff'),
      reason: requireString(h, 'reason', '<result>.handoff'),
      deliverables: requireStringArray(h.deliverables, 'deliverables', '<result>.handoff'),
    };
  }

  let approvalRequest: ExecutionResult['approval_request'];
  if (status === 'needs_approval') {
    if (!isPlainObject(raw.approval_request)) {
      throw new Error(
        "ExecutionResult with status 'needs_approval' requires approval_request.{action_type, target, reason, risks, rollback_plan}",
      );
    }
    const a = raw.approval_request;
    approvalRequest = {
      action_type: requireString(a, 'action_type', '<result>.approval_request'),
      target: requireString(a, 'target', '<result>.approval_request'),
      reason: requireString(a, 'reason', '<result>.approval_request'),
      risks: requireString(a, 'risks', '<result>.approval_request'),
      rollback_plan: requireString(a, 'rollback_plan', '<result>.approval_request'),
    };
  }

  return {
    status,
    summary: raw.summary.trim(),
    evidence,
    handoff,
    approval_request: approvalRequest,
  };
}
