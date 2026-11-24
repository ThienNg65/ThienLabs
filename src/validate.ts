import fs from 'node:fs';
import path from 'node:path';
import {
  type ValidationIssue,
  assertAgentContract,
  assertApprovalRequest,
  assertCrossDepartmentHandoff,
  assertGovernanceDoc,
  assertQualityAuditReport,
  assertTaskBrief,
  classificationRank,
  isClassificationTier,
} from './contracts.js';
import { extractRelativeLinks, parseMarkdownFile, parseProjectRegistry } from './parser.js';

export interface ValidationResult {
  checkedFiles: number;
  issues: ValidationIssue[];
  errors: string[];
}

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'runtime']);

const SRC_LAYERS: Record<string, number> = {
  'contracts.ts': 0,
  'parser.ts': 1,
  'ledger.ts': 1,
  'context.ts': 2,
  'validate.ts': 2,
  'dispatch.ts': 3,
  'cli.ts': 4,
};

function formatIssue(issue: ValidationIssue): string {
  return `[${issue.code}] ${issue.file}: ${issue.message} | Rule: ${issue.rule} | Fix: ${issue.fixHint}`;
}

function collectMarkdownFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results.sort();
}

function isTemplateFile(rootDir: string, filePath: string): boolean {
  const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
  return rel.startsWith('organization/templates/');
}

function checkPublicIsolation(
  filePath: string,
  body: string,
  sources: unknown,
  privateRepoPaths: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const noCode = body.replace(/```[\s\S]*?```/g, '');
  // Flag Markdown links pointing directly to private ThienNg65/ferry repo (not -release or -website)
  const linkRegex = /\[[^\]]+\]\((https?:\/\/github\.com\/ThienNg65\/ferry(?:\/[^)]*)?)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(noCode)) !== null) {
    issues.push({
      code: 'ERR-ISOLATION-PRIVATE-LINK',
      file: filePath,
      rule: 'organization/governance/security-policy.md',
      message: `public document links to private repo (${m[1]})`,
      fixHint: 'Replace with the public ThienNg65/ferry-release or ferryssh.com URL.',
    });
  }

  const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const isPrivatePathRef = (text: string): boolean => {
    const norm = text.replace(/\\/g, '/').toLowerCase();
    const candidates = ['c:/toys/ferry-dev/ferry', ...privateRepoPaths];
    return candidates.some((repoPath) =>
      new RegExp(`(?:^|[\\s\`'"(])${escapeRegex(repoPath)}(?:/|$|[\\s\`'")])`).test(norm),
    );
  };

  for (const line of noCode.split(/\r?\n/)) {
    if (/\b(never|excluded|out-of-scope|do not|must not|not expose)\b/i.test(line)) {
      continue;
    }
    if (isPrivatePathRef(line)) {
      issues.push({
        code: 'ERR-ISOLATION-PRIVATE-PATH',
        file: filePath,
        rule: 'organization/governance/security-policy.md',
        message: 'public document exposes private-engineering local path',
        fixHint: 'Remove the local private-engineering path from public-facing artifacts.',
      });
    }
  }

  if (Array.isArray(sources)) {
    for (const src of sources) {
      const s = String(src);
      if (isPrivatePathRef(s) || /projects[/\\][^/\\]+[/\\](development|education)[/\\]/i.test(s)) {
        issues.push({
          code: 'ERR-ISOLATION-SOURCE',
          file: filePath,
          rule: 'organization/governance/security-policy.md',
          message: `public document sources private-engineering path (${s})`,
          fixHint: 'Remove private-engineering sources or raise access_classification if internal.',
        });
      }
    }
  }

  return issues;
}

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results.sort();
}

/** Enforces src/ acyclic DAG layering and bans workaround comments, TS suppressions, and any. */
export function validateCodebaseHygiene(rootDir: string): ValidationIssue[] {
  const srcDir = path.join(rootDir, 'src');
  if (!fs.existsSync(srcDir)) return [];

  const issues: ValidationIssue[] = [];
  const forbiddenPatterns: Array<{ code: string; regex: RegExp; label: string }> = [
    { code: 'ERR-NO-WORKAROUND', regex: /\/\/\s*([H]ACK|[X]XX|[F]IXME)\b/, label: 'excuse comment' },
    { code: 'ERR-NO-WORKAROUND', regex: /\/\/\s*T[O]DO:\s*workaround/i, label: 'workaround comment' },
    { code: 'ERR-NO-TS-SUPPRESS', regex: /@ts-(?:ig[n]ore|expect-error)/, label: 'TypeScript suppression' },
    { code: 'ERR-NO-ANY', regex: /(?::\s*|\bas\s+)a[n]y\b/, label: 'untyped any' },
  ];

  for (const fullPath of collectTsFiles(srcDir)) {
    const rel = path.relative(rootDir, fullPath).replace(/\\/g, '/');
    const content = fs.readFileSync(fullPath, 'utf8');
    const isTopLevelSrc = path.dirname(fullPath) === srcDir;
    const importerLayer = isTopLevelSrc ? SRC_LAYERS[path.basename(fullPath)] : undefined;

    if (importerLayer !== undefined) {
      const importRegex = /from\s+['"]\.\/([^'"]+)\.js['"]/g;
      let m: RegExpExecArray | null;
      while ((m = importRegex.exec(content)) !== null) {
        const targetFile = `${m[1]}.ts`;
        const targetLayer = SRC_LAYERS[targetFile];
        if (targetLayer === undefined || targetLayer >= importerLayer) {
          issues.push({
            code: 'ERR-ARCH-LAYER',
            file: rel,
            rule: 'src/ DAG Layering (contracts < parser,ledger < context,validate < dispatch < cli)',
            message: `illegal import './${m[1]}.js' (layer ${String(targetLayer)} >= ${importerLayer})`,
            fixHint: 'Move shared types/helpers to a lower layer (e.g. src/contracts.ts) to preserve the acyclic DAG.',
          });
        }
      }
    }

    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      for (const pat of forbiddenPatterns) {
        if (pat.regex.test(line)) {
          issues.push({
            code: pat.code,
            file: `${rel}:${i + 1}`,
            rule: 'Issue #2 Workstream A.3 (Zero Workarounds)',
            message: `forbidden ${pat.label} found`,
            fixHint: 'Resolve the root cause with strict TypeScript types instead of suppressing or bypassing checks.',
          });
        }
      }
    }
  }

  return issues;
}

/** Validates repository Markdown contracts, links, isolation boundaries, and src/ hygiene. */
export function validateRepo(rootDir: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const mdFiles = collectMarkdownFiles(rootDir);

  const registryIds = new Set<string>();
  const privateRepoPaths: string[] = [];
  const registryPath = path.join(rootDir, 'organization', 'project-registry.md');
  if (fs.existsSync(registryPath)) {
    try {
      for (const entry of parseProjectRegistry(rootDir)) {
        registryIds.add(entry.project_id);
        for (const repo of entry.external_repos) {
          if (classificationRank(repo.classification) >= 2) {
            privateRepoPaths.push(repo.localPath.replace(/\\/g, '/').toLowerCase());
          }
        }
        if ((entry.status === 'active' || entry.status === 'active-pilot') && !fs.existsSync(entry.context_path)) {
          issues.push({
            code: 'ERR-REGISTRY-CONTEXT',
            file: 'organization/project-registry.md',
            rule: 'organization/project-registry.md',
            message: `missing context_path for '${entry.project_id}'`,
            fixHint: `Run 'thienlabs init-project --id ${entry.project_id}' or create ${entry.context_path}.`,
          });
        }
      }
    } catch (err) {
      issues.push({
        code: 'ERR-REGISTRY-PARSE',
        file: 'organization/project-registry.md',
        rule: 'organization/project-registry.md',
        message: err instanceof Error ? err.message : String(err),
        fixHint: 'Fix the Markdown table format in organization/project-registry.md.',
      });
    }
  }

  // Pre-collect known agent IDs and approved APR task IDs for cross-reference validation
  const knownAgents = new Set<string>(['director', 'chief-of-staff']);
  const approvedTaskIds = new Set<string>();
  const parsedDocs: Array<{ filePath: string; rel: string; fm: Record<string, unknown> | null; body: string }> = [];

  for (const filePath of mdFiles) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    let parsed;
    try {
      parsed = parseMarkdownFile(filePath);
    } catch (err) {
      issues.push({
        code: 'ERR-FRONTMATTER-PARSE',
        file: rel,
        rule: 'YAML Frontmatter Contract',
        message: err instanceof Error ? err.message : String(err),
        fixHint: 'Ensure valid YAML frontmatter delimited by --- at the top of the file.',
      });
      continue;
    }

    parsedDocs.push({ filePath, rel, fm: parsed.frontmatter, body: parsed.body });
    const fm = parsed.frontmatter;
    if (fm && typeof fm.agent_id === 'string') {
      knownAgents.add(fm.agent_id);
    }
    if (fm && fm.doc_type === 'approval-request' && fm.status === 'approved' && typeof fm.related_task_id === 'string') {
      approvedTaskIds.add(fm.related_task_id);
    }
  }

  for (const { filePath, rel, fm, body } of parsedDocs) {
    const isTemplate = isTemplateFile(rootDir, filePath);
    const requiresFrontmatter =
      !isTemplate && (rel.startsWith('organization/') || rel.startsWith('projects/'));

    if (requiresFrontmatter && !fm) {
      issues.push({
        code: 'ERR-FRONTMATTER-MISSING',
        file: rel,
        rule: 'organization/governance/agent-governance.md',
        message: 'missing YAML frontmatter in governed directory',
        fixHint: 'Add typed YAML frontmatter matching an organization/templates/*.md schema.',
      });
    }

    if (!isTemplate && fm) {
      try {
        if (typeof fm.agent_id === 'string' || rel.endsWith('/lead.md')) {
          assertAgentContract(fm, rel);
        } else if (fm.doc_type === 'task-brief') {
          const brief = assertTaskBrief(fm, rel);
          if (brief.approval_stage === 'level-3' && brief.status === 'completed' && !approvedTaskIds.has(brief.doc_id)) {
            issues.push({
              code: 'ERR-LEVEL3-UNAPPROVED',
              file: rel,
              rule: 'organization/governance/approval-policy.md',
              message: `level-3 task '${brief.doc_id}' is marked completed without an approved APR-*.md record`,
              fixHint: `Run 'thienlabs approve --task ${brief.doc_id} --decision approved' after Director review.`,
            });
          }
        } else if (fm.doc_type === 'cross-department-handoff') {
          assertCrossDepartmentHandoff(fm, rel);
        } else if (fm.doc_type === 'approval-request') {
          const apr = assertApprovalRequest(fm, rel);
          if (apr.status === 'approved' || apr.status === 'rejected') {
            const statusLine = body.match(/-\s+\*\*Status:\*\*\s+(\S+)/);
            if (!statusLine || statusLine[1] !== apr.status) {
              issues.push({
                code: 'ERR-APR-STATUS-DRIFT',
                file: rel,
                rule: 'organization/templates/approval-request.md',
                message: `frontmatter status '${apr.status}' does not match Director Decision body status '${statusLine?.[1] ?? 'missing'}'`,
                fixHint: `Use 'thienlabs approve --task ${apr.related_task_id} --decision ${apr.status}' to keep both in sync.`,
              });
            }
          }
        } else if (fm.doc_type === 'quality-audit-report') {
          assertQualityAuditReport(fm, rel);
        } else if (typeof fm.doc_type === 'string') {
          assertGovernanceDoc(fm, rel);
        }
      } catch (err) {
        issues.push({
          code: 'ERR-CONTRACT-SCHEMA',
          file: rel,
          rule: 'src/contracts.ts',
          message: err instanceof Error ? err.message : String(err),
          fixHint: 'Compare frontmatter fields against the corresponding template in organization/templates/.',
        });
      }

      if (registryIds.size > 0 && typeof fm.project_id === 'string') {
        if (fm.project_id !== 'organization' && !registryIds.has(fm.project_id)) {
          issues.push({
            code: 'ERR-UNKNOWN-PROJECT',
            file: rel,
            rule: 'organization/project-registry.md',
            message: `unregistered project_id '${fm.project_id}'`,
            fixHint: `Register '${fm.project_id}' via 'thienlabs init-project' or fix project_id.`,
          });
        }
      }

      if (knownAgents.size > 2) {
        for (const field of ['owner', 'from_agent', 'to_agent', 'requested_by'] as const) {
          const val = fm[field];
          if (typeof val === 'string' && !knownAgents.has(val)) {
            issues.push({
              code: 'ERR-UNKNOWN-AGENT',
              file: rel,
              rule: 'organization/governance/agent-governance.md',
              message: `unknown agent_id '${val}' in field '${field}'`,
              fixHint: 'Use a registered agent_id from projects/<project>/<dept>/*.md or org-chief-of-staff.',
            });
          }
        }
      }

      if (
        isClassificationTier(fm.access_classification) &&
        classificationRank(fm.access_classification) === 0
      ) {
        issues.push(...checkPublicIsolation(rel, body, fm.sources, privateRepoPaths));
      }

      if (rel.startsWith('projects/') && (fm.status === 'completed' || fm.status === 'approved')) {
        const bodyNoCode = body.replace(/```[\s\S]*?```/g, '');
        if (/\bYYYY-MM-DD\b/.test(bodyNoCode)) {
          issues.push({
            code: 'ERR-PLACEHOLDER-REMAINING',
            file: rel,
            rule: 'organization/governance/agent-governance.md',
            message: `completed/approved artifact still contains 'YYYY-MM-DD' placeholder`,
            fixHint: 'Replace template placeholders with actual observed dates/values.',
          });
        }
      }
    }

    for (const target of extractRelativeLinks(body)) {
      const resolved = path.resolve(path.dirname(filePath), target);
      if (!fs.existsSync(resolved)) {
        issues.push({
          code: 'ERR-LINK-BROKEN',
          file: rel,
          rule: 'Markdown Link Integrity',
          message: `broken relative link -> ${target}`,
          fixHint: 'Update or remove the broken relative path.',
        });
      }
    }
  }

  issues.push(...validateCodebaseHygiene(rootDir));

  return {
    checkedFiles: mdFiles.length,
    issues,
    errors: issues.map(formatIssue),
  };
}
