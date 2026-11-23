import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { validateRepo } from '../validate.js';

describe('validateRepo', () => {
  it('passes across all Markdown files in ThienLabs', () => {
    const res = validateRepo(process.cwd());
    assert.ok(res.checkedFiles >= 31, `expected >= 31 files, got ${res.checkedFiles}`);
    assert.deepEqual(res.errors, []);
  });

  it('catches broken relative links and public-marketing private repo leaks', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-val-'));
    try {
      fs.mkdirSync(path.join(tmp, 'projects', 'demo', 'marketing'), { recursive: true });
      fs.writeFileSync(
        path.join(tmp, 'projects', 'demo', 'marketing', 'post.md'),
        `---
doc_id: MKT-DEMO-001
access_classification: public-marketing
---
See [broken](missing.md) and [source](https://github.com/ThienNg65/ferry/blob/main/README.md).
`,
        'utf8',
      );
      const res = validateRepo(tmp);
      assert.equal(res.errors.length, 2);
      assert.ok(res.errors.some((e) => e.includes('broken relative link')));
      assert.ok(res.errors.some((e) => e.includes('links to private repo')));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
