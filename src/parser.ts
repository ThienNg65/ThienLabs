import fs from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  type ClassificationTier,
  type ExternalRepoEntry,
  type ProjectRegistryEntry,
  isClassificationTier,
} from './contracts.js';

export interface ParsedMarkdown {
  filePath: string;
  hasFrontmatter: boolean;
  frontmatter: Record<string, unknown> | null;
  body: string;
}

export function parseMarkdownFile(filePath: string): ParsedMarkdown {
  const raw = fs.readFileSync(filePath, 'utf8');
  return parseMarkdownContent(raw, filePath);
}

export function parseMarkdownContent(raw: string, filePath = '<memory>'): ParsedMarkdown {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    if (raw.startsWith('---\n') || raw.startsWith('---\r\n')) {
      throw new Error(`${filePath}: malformed YAML frontmatter (missing closing ---)`);
    }
    return { filePath, hasFrontmatter: false, frontmatter: null, body: raw };
  }
  const yamlText = match[1] ?? '';
  const body = match[2] ?? '';
  const parsed = parseYaml(yamlText);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${filePath}: frontmatter must be a YAML mapping`);
  }
  return {
    filePath,
    hasFrontmatter: true,
    frontmatter: parsed as Record<string, unknown>,
    body,
  };
}

export function extractRelativeLinks(markdown: string): string[] {
  // Strip fenced code blocks before scanning for Markdown links
  const stripped = markdown.replace(/```[\s\S]*?```/g, '');
  const links: string[] = [];
  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(stripped)) !== null) {
    const rawTarget = (match[1] ?? '').split('#')[0]?.trim() ?? '';
    if (!rawTarget || /^(https?:|mailto:)/i.test(rawTarget)) {
      continue;
    }
    links.push(rawTarget);
  }
  return links;
}

export function parseProjectRegistry(rootDir: string): ProjectRegistryEntry[] {
  const registryPath = path.join(rootDir, 'organization', 'project-registry.md');
  const { body } = parseMarkdownFile(registryPath);
  const entries: ProjectRegistryEntry[] = [];

  for (const line of body.split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue;
    const cols = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (cols.length < 5) continue;
    const idCol = cols[0] ?? '';
    if (idCol === '`project_id`' || idCol.startsWith('---')) continue;

    const projectId = idCol.replace(/`/g, '').trim();
    const name = (cols[1] ?? '').trim();
    const status = (cols[2] ?? '').replace(/`/g, '').trim();
    const linkMatch = (cols[3] ?? '').match(/\(([^)]+)\)/);
    const relContextPath = linkMatch?.[1] ?? '';
    const contextPath = path.resolve(path.dirname(registryPath), relContextPath);

    const externalRepos: ExternalRepoEntry[] = [];
    const repoMatches = (cols[4] ?? '').matchAll(/`([^`]+)`\s*\(`([^`]+)`\)/g);
    for (const rm of repoMatches) {
      const repoPath = rm[1]?.trim() ?? '';
      const cls = rm[2]?.trim() ?? '';
      if (repoPath && isClassificationTier(cls)) {
        externalRepos.push({ localPath: path.resolve(repoPath), classification: cls as ClassificationTier });
      }
    }

    entries.push({
      project_id: projectId,
      name,
      status,
      context_path: contextPath,
      external_repos: externalRepos,
    });
  }

  return entries;
}
