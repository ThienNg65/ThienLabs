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
  department: string;
  role: string;
  reports_to: string;
  status: 'active' | 'paused' | 'deprecated';
  version?: string;
  access_classification: ClassificationTier;
  tools: string[];
  permissions: AgentPermissions;
  provider_policy: string;
}

export interface TaskBrief {
  doc_id: string;
  project_id: string;
  department: string;
  doc_type: 'task-brief';
  owner: string;
  created_by: string;
  parent_task_id: string | null;
  status: string;
  priority: string;
  hop_count: number;
  max_hops: number;
  approval_stage: 'level-1' | 'level-2' | 'level-3';
  version?: string;
  access_classification: ClassificationTier;
  sources: string[];
  supersedes?: string | null;
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

export function assertAgentContract(data: Record<string, unknown>, filePath: string): AgentContract {
  const required = [
    'agent_id',
    'name',
    'project_id',
    'department',
    'role',
    'reports_to',
    'status',
    'access_classification',
    'provider_policy',
  ];
  for (const key of required) {
    if (typeof data[key] !== 'string' || !String(data[key]).trim()) {
      throw new Error(`${filePath}: missing or invalid string field '${key}'`);
    }
  }
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }
  const perms = data.permissions as Record<string, unknown> | undefined;
  if (!perms || !Array.isArray(perms.read) || !Array.isArray(perms.write)) {
    throw new Error(`${filePath}: permissions.read and permissions.write must be arrays`);
  }
  return data as unknown as AgentContract;
}

export function assertTaskBrief(data: Record<string, unknown>, filePath: string): TaskBrief {
  const required = ['doc_id', 'project_id', 'department', 'owner', 'created_by', 'status', 'approval_stage'];
  for (const key of required) {
    if (typeof data[key] !== 'string' || !String(data[key]).trim()) {
      throw new Error(`${filePath}: missing or invalid string field '${key}'`);
    }
  }
  if (data.doc_type !== 'task-brief') {
    throw new Error(`${filePath}: expected doc_type 'task-brief'`);
  }
  if (!isClassificationTier(data.access_classification)) {
    throw new Error(`${filePath}: invalid access_classification '${String(data.access_classification)}'`);
  }
  const hopCount = Number(data.hop_count ?? 0);
  const maxHops = Number(data.max_hops ?? 4);
  if (Number.isNaN(hopCount) || Number.isNaN(maxHops)) {
    throw new Error(`${filePath}: hop_count and max_hops must be numbers`);
  }
  return {
    ...(data as unknown as TaskBrief),
    hop_count: hopCount,
    max_hops: maxHops,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
  };
}
