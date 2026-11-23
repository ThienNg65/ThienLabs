import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { buildContext, initProject } from '../context.js';

describe('buildContext isolation on Ferry', () => {
  it('blocks ferry-mkt-lead (public-marketing) from reading private-engineering files', () => {
    const envelope = buildContext({
      rootDir: process.cwd(),
      projectId: 'ferry',
      agentId: 'ferry-mkt-lead',
      briefSources: [
        'C:/toys/ferry-dev/ferry/CLAUDE.md',
        'projects/ferry/development/lead.md',
        'C:/toys/ferry-dev/ferry-website/PRODUCT.md',
      ],
    });

    const loadedPaths = envelope.files.map((f) => f.path.replace(/\\/g, '/').toLowerCase());
    assert.ok(!loadedPaths.some((p) => p.includes('/ferry-dev/ferry/claude.md')));
    assert.ok(!loadedPaths.some((p) => p.endsWith('/development/lead.md')));
    assert.ok(envelope.skipped.some((s) => s.reason.startsWith('blocked:')));
  });

  it('allows ferry-edu-lead (private-engineering) to read authorized Ferry context', () => {
    const envelope = buildContext({
      rootDir: process.cwd(),
      projectId: 'ferry',
      agentId: 'ferry-edu-lead',
      briefSources: ['projects/ferry/development/lead.md'],
    });
    const loadedPaths = envelope.files.map((f) => f.path.replace(/\\/g, '/').toLowerCase());
    assert.ok(loadedPaths.some((p) => p.endsWith('/projects/ferry/project-context.md')));
    assert.ok(loadedPaths.some((p) => p.endsWith('/projects/ferry/development/lead.md')));
  });

  it('skips documents with status: superseded', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-ctx-'));
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
        path.join(tmp, 'projects', 'demo', 'old-spec.md'),
        `---\nstatus: superseded\naccess_classification: internal\n---\n# Old\n`,
      );
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'product', 'lead.md'),
        `---\nagent_id: demo-prd-lead\nname: Demo Product\nproject_id: demo\ndepartment: product\nrole: Lead\nreports_to: chief-of-staff\nstatus: active\naccess_classification: internal\npermissions:\n  read: [projects/demo/]\n  write: [projects/demo/product/]\n  execute: []\n  external_action: none\nprovider_policy: structured-specifications\n---\n`,
      );

      const env = buildContext({
        rootDir: tmp,
        projectId: 'demo',
        agentId: 'demo-prd-lead',
        briefSources: ['projects/demo/old-spec.md'],
      });
      assert.ok(env.skipped.some((s) => s.reason === 'skipped:superseded'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('initProject', () => {
  it('supports dry-run without mutating disk', () => {
    const res = initProject({
      rootDir: process.cwd(),
      projectId: 'vietexplore',
      name: 'VietExplore',
      dryRun: true,
    });
    assert.equal(res.registryUpdated, false);
    assert.equal(res.createdFiles.length, 9);
  });
});
