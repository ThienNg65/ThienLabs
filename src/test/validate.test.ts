import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { validateCodebaseHygiene, validateRepo } from '../validate.js';

describe('validateRepo', () => {
  it('passes across all Markdown files and src/ DAG hygiene in ThienLabs', () => {
    const res = validateRepo(process.cwd());
    assert.ok(res.checkedFiles >= 31, `expected >= 31 files, got ${res.checkedFiles}`);
    assert.deepEqual(res.errors, []);
  });

  it('catches broken relative links, public-marketing private repo leaks, and missing frontmatter', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-val-'));
    try {
      fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'marketing'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'marketing', 'post.md'),
        `---
doc_id: MKT-DEMO-001
project_id: demo
department: marketing
doc_type: decision-record
owner: chief-of-staff
status: active
access_classification: public-marketing
---
See [broken](missing.md) and [source](https://github.com/ThienNg65/ferry/blob/main/README.md).
`,
        'utf8',
      );
      const res = validateRepo(tmp);
      assert.equal(res.issues.length, 2);
      assert.ok(res.issues.some((i) => i.code === 'ERR-LINK-BROKEN'));
      assert.ok(res.issues.some((i) => i.code === 'ERR-ISOLATION-PRIVATE-LINK' && i.fixHint.length > 0));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('catches src/ DAG layer violations and forbidden workaround comments', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-hyg-'));
    try {
      fs.mkdirSync(path.join(tmp, 'src'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'src', 'contracts.ts'),
        `import { parseMarkdownFile } from './parser.js';\n// HA` + `CK: bypass\nexport const x = parseMarkdownFile;\n`,
        'utf8',
      );
      const issues = validateCodebaseHygiene(tmp);
      assert.ok(issues.some((i) => i.code === 'ERR-ARCH-LAYER'));
      assert.ok(issues.some((i) => i.code === 'ERR-NO-WORKAROUND'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('catches Level 3 completed task without approved APR and APR status drift', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-apr-'));
    try {
      fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'product'), { recursive: true });
      fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'decisions'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'product', 'TASK-DEMO-001.md'),
        `---\ndoc_id: TASK-DEMO-001\nproject_id: demo\ndepartment: product\ndoc_type: task-brief\nowner: chief-of-staff\ncreated_by: chief-of-staff\nstatus: completed\npriority: high\nhop_count: 1\nmax_hops: 4\napproval_stage: level-3\naccess_classification: internal\n---\n# Task\n`,
        'utf8',
      );
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'decisions', 'APR-TASK-DEMO-001.md'),
        `---\ndoc_id: APR-TASK-DEMO-001\nproject_id: demo\ndepartment: product\ndoc_type: approval-request\nrequested_by: chief-of-staff\nrelated_task_id: TASK-DEMO-001\nstatus: approved\naccess_classification: internal\n---\n## Director Decision\n- **Status:** pending\n`,
        'utf8',
      );
      const res = validateRepo(tmp);
      assert.ok(res.issues.some((i) => i.code === 'ERR-APR-STATUS-DRIFT'));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
