import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  type AgentContract,
  type ProjectRegistryEntry,
  assertAgentContract,
  classificationRank,
  isClassificationTier,
} from './contracts.js';
import { parseMarkdownFile, parseProjectRegistry } from './parser.js';

export interface ContextFile {
  path: string;
  classification: string;
  content: string;
}

export interface ContextEnvelope {
  project: ProjectRegistryEntry;
  agent: AgentContract;
  files: ContextFile[];
  skipped: Array<{ path: string; reason: string }>;
}

function normalizeForCompare(p: string): string {
  const resolved = path.resolve(p);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function isPathInside(candidate: string, allowedPrefix: string, rootDir: string): boolean {
  const absPrefix = path.isAbsolute(allowedPrefix)
    ? path.resolve(allowedPrefix)
    : path.resolve(rootDir, allowedPrefix);
  const normCandidate = normalizeForCompare(candidate);
  const normPrefix = normalizeForCompare(absPrefix);
  return normCandidate === normPrefix || normCandidate.startsWith(normPrefix + path.sep);
}

export function listProjectAgents(rootDir: string, projectId: string): AgentContract[] {
  const candidates: string[] = [path.join(rootDir, 'organization', 'chief-of-staff.md')];
  const projectDir = path.join(rootDir, 'projects', projectId);
  if (fs.existsSync(projectDir)) {
    for (const entry of fs.readdirSync(projectDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const deptDir = path.join(projectDir, entry.name);
      for (const file of fs.readdirSync(deptDir, { withFileTypes: true })) {
        if (file.isFile() && file.name.endsWith('.md')) {
          candidates.push(path.join(deptDir, file.name));
        }
      }
    }
  }

  const agents: AgentContract[] = [];
  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const parsed = parseMarkdownFile(filePath);
    if (parsed.frontmatter && typeof parsed.frontmatter.agent_id === 'string') {
      agents.push(assertAgentContract(parsed.frontmatter, filePath));
    }
  }
  return agents;
}

export function findAgentContract(rootDir: string, projectId: string, agentId: string): AgentContract {
  const match = listProjectAgents(rootDir, projectId).find((a) => a.agent_id === agentId);
  if (!match) {
    throw new Error(`Agent contract not found for agent_id='${agentId}' in project '${projectId}'`);
  }
  return match;
}

export function buildContext(options: {
  rootDir: string;
  projectId: string;
  agentId: string;
  briefSources?: string[];
  maxFiles?: number;
  maxTotalChars?: number;
}): ContextEnvelope {
  const { rootDir, projectId, agentId, briefSources = [], maxFiles = 12, maxTotalChars = 48000 } = options;

  const registry = parseProjectRegistry(rootDir);
  const project = registry.find((p) => p.project_id === projectId);
  if (!project) {
    throw new Error(`Project '${projectId}' is not registered in organization/project-registry.md`);
  }
  if (project.status !== 'active' && project.status !== 'active-pilot') {
    throw new Error(`Project '${projectId}' has status '${project.status}' (must be active or active-pilot)`);
  }

  const agent = findAgentContract(rootDir, projectId, agentId);
  if (agent.status !== 'active') {
    throw new Error(`Agent '${agentId}' has status '${agent.status}'`);
  }
  if (agent.project_id !== projectId && agent.project_id !== 'organization') {
    throw new Error(`Agent '${agentId}' belongs to '${agent.project_id}', not '${projectId}'`);
  }

  const agentRank = classificationRank(agent.access_classification);

  // Deterministic candidate list per security-policy.md
  const rawCandidates: string[] = [
    project.context_path,
    path.join(rootDir, 'projects', projectId, 'goals-and-metrics.md'),
    ...briefSources.map((s) => (path.isAbsolute(s) ? path.resolve(s) : path.resolve(rootDir, s))),
  ];

  for (const extRepo of project.external_repos) {
    for (const indexFile of ['PRODUCT.md', 'DESIGN.md', 'CLAUDE.md', '.claude/PROJECT_MAP.md']) {
      const candidate = path.join(extRepo.localPath, indexFile);
      if (fs.existsSync(candidate)) {
        rawCandidates.push(candidate);
      }
    }
  }

  const seen = new Set<string>();
  const files: ContextFile[] = [];
  const skipped: Array<{ path: string; reason: string }> = [];
  const projectsRoot = path.join(rootDir, 'projects');
  const ownProjectRoot = path.join(projectsRoot, projectId);
  let totalChars = 0;

  for (const candidate of rawCandidates) {
    if (files.length >= maxFiles) break;
    const resolved = path.resolve(candidate);
    const key = normalizeForCompare(resolved);
    if (seen.has(key)) continue;
    seen.add(key);

    if (!fs.existsSync(resolved)) {
      skipped.push({ path: resolved, reason: 'missing' });
      continue;
    }

    // 0. Enforce strict cross-project boundary
    if (isPathInside(resolved, projectsRoot, rootDir) && !isPathInside(resolved, ownProjectRoot, rootDir)) {
      skipped.push({ path: resolved, reason: 'blocked:cross_project' });
      continue;
    }

    // 1. Check permissions.read
    const allowedByRead = agent.permissions.read.some((prefix) => isPathInside(resolved, prefix, rootDir));
    if (!allowedByRead) {
      skipped.push({ path: resolved, reason: 'blocked:permissions' });
      continue;
    }

    // 2. Check external repo classification ceiling
    const matchedRepo = project.external_repos.find((r) => isPathInside(resolved, r.localPath, rootDir));
    if (matchedRepo && classificationRank(matchedRepo.classification) > agentRank) {
      skipped.push({
        path: resolved,
        reason: `blocked:classification (${matchedRepo.classification} > ${agent.access_classification})`,
      });
      continue;
    }

    // 3. Check frontmatter classification & freshness if Markdown
    let fileClass: string = matchedRepo?.classification ?? 'internal';
    if (resolved.endsWith('.md')) {
      const parsed = parseMarkdownFile(resolved);
      if (parsed.frontmatter) {
        const status = parsed.frontmatter.status;
        if (status === 'superseded' || status === 'deprecated') {
          skipped.push({ path: resolved, reason: `skipped:${String(status)}` });
          continue;
        }
        const fmClass = parsed.frontmatter.access_classification;
        if (isClassificationTier(fmClass)) {
          fileClass = fmClass;
        }
      }
    }

    // Enforce classification ceiling unconditionally for both Markdown and non-Markdown files
    if (isClassificationTier(fileClass) && classificationRank(fileClass) > agentRank) {
      skipped.push({
        path: resolved,
        reason: `blocked:classification (${fileClass} > ${agent.access_classification})`,
      });
      continue;
    }

    const content = fs.readFileSync(resolved, 'utf8');
    if (totalChars + content.length > maxTotalChars) {
      skipped.push({ path: resolved, reason: 'skipped:token_budget' });
      continue;
    }
    totalChars += content.length;
    files.push({ path: resolved, classification: fileClass, content });
  }

  return { project, agent, files, skipped };
}

/** Formats authorized context files inside non-spoofable untrusted-data boundaries. */
export function formatContextEnvelope(envelope: ContextEnvelope): string {
  const nonce = crypto.randomBytes(6).toString('hex');
  const sections = envelope.files.map((f) => {
    const safeContent = f.content.replace(
      /===\s*(BEGIN|END)\s+UNTRUSTED CONTEXT DATA/gi,
      '=== [ESCAPED $1 UNTRUSTED CONTEXT DATA]',
    );
    return `=== BEGIN UNTRUSTED CONTEXT DATA [${nonce}] (${f.path} | ${f.classification}) ===\n${safeContent}\n=== END UNTRUSTED CONTEXT DATA [${nonce}] ===`;
  });
  return sections.join('\n\n');
}

export function initProject(options: {
  rootDir: string;
  projectId: string;
  name: string;
  dryRun?: boolean;
}): { createdFiles: string[]; registryUpdated: boolean } {
  const { rootDir, projectId, name, dryRun = false } = options;
  if (!/^[a-z0-9-]+$/.test(projectId)) {
    throw new Error(`Invalid project_id '${projectId}': use lowercase alphanumeric and hyphens only`);
  }

  const registry = parseProjectRegistry(rootDir);
  if (registry.some((p) => p.project_id === projectId)) {
    throw new Error(`Project '${projectId}' already exists in organization/project-registry.md`);
  }

  const today = new Date().toISOString().slice(0, 10);
  const projectDir = path.join(rootDir, 'projects', projectId);
  const createdFiles: string[] = [
    path.join(projectDir, 'project-context.md'),
    path.join(projectDir, 'project-vision.md'),
    path.join(projectDir, 'goals-and-metrics.md'),
    path.join(projectDir, 'decisions', '.gitkeep'),
    path.join(projectDir, 'knowledge-base', '.gitkeep'),
  ];

  const departments = [
    { dept: 'marketing', role: 'Marketing Lead', policy: 'research-and-copy', cls: 'public-marketing' },
    { dept: 'product', role: 'Product Lead', policy: 'structured-specifications', cls: 'internal' },
    { dept: 'development', role: 'Engineering Lead', policy: 'repository-aware-coding', cls: 'private-engineering' },
    { dept: 'education', role: 'Education & Engineering Excellence Lead', policy: 'independent-audit', cls: 'private-engineering' },
  ];

  for (const d of departments) {
    createdFiles.push(path.join(projectDir, d.dept, 'lead.md'));
  }

  if (dryRun) {
    return { createdFiles, registryUpdated: false };
  }

  fs.mkdirSync(path.join(projectDir, 'decisions'), { recursive: true });
  fs.mkdirSync(path.join(projectDir, 'knowledge-base'), { recursive: true });

  fs.writeFileSync(
    path.join(projectDir, 'project-context.md'),
    `---\ndoc_id: PRJ-${projectId.toUpperCase()}-CTX-001\nproject_id: ${projectId}\ndepartment: orchestration\ndoc_type: project-context\nowner: chief-of-staff\nstatus: active\nversion: "1.0"\naccess_classification: internal\ncreated_at: "${today}"\nupdated_at: "${today}"\n---\n\n# ${name} Project Context\n\n## Authorized Repositories & Classification Boundaries\n\n| Repo | Local Path | Remote | Classification | Purpose |\n|---|---|---|---|---|\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(projectDir, 'project-vision.md'),
    `---\ndoc_id: PRJ-${projectId.toUpperCase()}-VIS-001\nproject_id: ${projectId}\ndepartment: product\ndoc_type: project-vision\nowner: ${projectId}-prd-lead\nstatus: active\nversion: "1.0"\naccess_classification: internal\ncreated_at: "${today}"\nupdated_at: "${today}"\n---\n\n# ${name} Project Vision\n\nTBD.\n`,
    'utf8',
  );

  fs.writeFileSync(
    path.join(projectDir, 'goals-and-metrics.md'),
    `---\ndoc_id: PRJ-${projectId.toUpperCase()}-GOALS-001\nproject_id: ${projectId}\ndepartment: orchestration\ndoc_type: goals-and-metrics\nowner: chief-of-staff\nstatus: active\nversion: "1.0"\naccess_classification: internal\ncreated_at: "${today}"\nupdated_at: "${today}"\n---\n\n# ${name} Goals & Validation Metrics\n\nTBD.\n`,
    'utf8',
  );

  fs.writeFileSync(path.join(projectDir, 'decisions', '.gitkeep'), '', 'utf8');
  fs.writeFileSync(path.join(projectDir, 'knowledge-base', '.gitkeep'), '', 'utf8');

  for (const d of departments) {
    const dir = path.join(projectDir, d.dept);
    fs.mkdirSync(dir, { recursive: true });
    const shortDept = d.dept === 'development' ? 'eng' : d.dept.slice(0, 3);
    fs.writeFileSync(
      path.join(dir, 'lead.md'),
      `---\nagent_id: ${projectId}-${shortDept}-lead\nname: ${name} ${d.role}\nproject_id: ${projectId}\ndepartment: ${d.dept}\nrole: ${d.role}\nreports_to: chief-of-staff\nstatus: active\nversion: "1.0"\naccess_classification: ${d.cls}\ntools:\n  - filesystem-read\n  - filesystem-write-project\npermissions:\n  read:\n    - organization/governance/\n    - organization/templates/\n    - projects/${projectId}/\n  write:\n    - projects/${projectId}/${d.dept}/\n  execute: []\n  external_action: none\nprovider_policy: ${d.policy}\ncreated_at: "${today}"\nupdated_at: "${today}"\n---\n\n# ${name} ${d.role}\n\n## Mission\nOwn ${d.dept} execution for ${name}.\n`,
      'utf8',
    );
  }

  // Append row to project-registry.md before ## Rules
  const registryPath = path.join(rootDir, 'organization', 'project-registry.md');
  const regContent = fs.readFileSync(registryPath, 'utf8');
  const newRow = `| \`${projectId}\` | ${name} | \`active\` | [project-context.md](../projects/${projectId}/project-context.md) | TBD |`;
  const updated = regContent.replace(/\r?\n## Rules/, `\n${newRow}\n\n## Rules`);
  fs.writeFileSync(registryPath, updated, 'utf8');

  return { createdFiles, registryUpdated: true };
}
