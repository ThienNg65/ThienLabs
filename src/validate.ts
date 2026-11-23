import fs from 'node:fs';
import path from 'node:path';
import {
  assertAgentContract,
  assertTaskBrief,
  classificationRank,
  isClassificationTier,
} from './contracts.js';
import { extractRelativeLinks, parseMarkdownFile, parseProjectRegistry } from './parser.js';

export interface ValidationResult {
  checkedFiles: number;
  errors: string[];
}

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'dist', 'runtime']);

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

function checkPublicIsolation(filePath: string, body: string): string[] {
  const errors: string[] = [];
  const noCode = body.replace(/```[\s\S]*?```/g, '');
  // Flag Markdown links pointing directly to private ThienNg65/ferry repo (not -release or -website)
  const linkRegex = /\[[^\]]+\]\((https?:\/\/github\.com\/ThienNg65\/ferry(?:\/[^)]*)?)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRegex.exec(noCode)) !== null) {
    errors.push(`${filePath}: public document links to private repo (${m[1]})`);
  }

  for (const line of noCode.split(/\r?\n/)) {
    if (/\b(never|excluded|out-of-scope|do not|must not|not expose)\b/i.test(line)) {
      continue;
    }
    if (/C:[/\\]toys[/\\]ferry-dev[/\\]ferry(?:[/\\]|$|\s|`)/i.test(line)) {
      errors.push(`${filePath}: public document exposes private-engineering local path`);
    }
  }
  return errors;
}

export function validateRepo(rootDir: string): ValidationResult {
  const errors: string[] = [];
  const mdFiles = collectMarkdownFiles(rootDir);

  for (const filePath of mdFiles) {
    let parsed;
    try {
      parsed = parseMarkdownFile(filePath);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
      continue;
    }

    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const isTemplate = isTemplateFile(rootDir, filePath);

    if (!isTemplate && parsed.hasFrontmatter && parsed.frontmatter) {
      const fm = parsed.frontmatter;
      if (typeof fm.agent_id === 'string' || rel.endsWith('/lead.md')) {
        try {
          assertAgentContract(fm, rel);
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      } else if (fm.doc_type === 'task-brief') {
        try {
          assertTaskBrief(fm, rel);
        } catch (err) {
          errors.push(err instanceof Error ? err.message : String(err));
        }
      }

      if (
        isClassificationTier(fm.access_classification) &&
        classificationRank(fm.access_classification) === 0
      ) {
        errors.push(...checkPublicIsolation(rel, parsed.body));
      }
    }

    for (const target of extractRelativeLinks(parsed.body)) {
      const resolved = path.resolve(path.dirname(filePath), target);
      if (!fs.existsSync(resolved)) {
        errors.push(`${rel}: broken relative link -> ${target}`);
      }
    }
  }

  // Verify project registry integrity
  const registryPath = path.join(rootDir, 'organization', 'project-registry.md');
  if (fs.existsSync(registryPath)) {
    try {
      const entries = parseProjectRegistry(rootDir);
      for (const entry of entries) {
        if (entry.status === 'active' || entry.status === 'active-pilot') {
          if (!fs.existsSync(entry.context_path)) {
            errors.push(`organization/project-registry.md: missing context_path for '${entry.project_id}'`);
          }
        }
      }
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  return { checkedFiles: mdFiles.length, errors };
}
