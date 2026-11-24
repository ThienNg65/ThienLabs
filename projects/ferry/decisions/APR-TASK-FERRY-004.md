---
doc_id: APR-TASK-FERRY-004
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-004
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-004]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-004-align-ci-node-version.md
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
---

# Director Approval Request: Align Ferry CI & Release Node.js Version (`TASK-FERRY-004`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` PR #190 (`https://github.com/ThienNg65/ferry/pull/190`, branch `ci/173-align-node-version`, commit `fe97ef439e82b17584bc1c24fe97ef43f6936fa4`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-004-align-ci-node-version.md](../development/TASK-FERRY-004-align-ci-node-version.md)).
- **Reason:** Resolve `ThienNg65/ferry#173` by updating pinned CI/release Node.js from `22.14.0` to `22.23.5` (satisfying `abbrev@5.0.0` and `nopt@10.0.1` `^22.22.2` engine requirements), adding `engines.node: ">=22.22.2"` to `package.json`, updating `CLAUDE.md`, and adding `.github/scripts/node-version-alignment.test.mjs`.

## Expected Impact & Risks
- Eliminates `EBADENGINE` warnings during `npm ci` in Windows CI and keeps `sync-public-readme` in `release.yml` on the same Node 22.23.5 runtime.
- Low risk: `.claude/PROJECT_MAP.md` line 19 still lists `Node v22.14.0` and was left untouched in this PR (noted in PR body).

## Validation Evidence
- Scratch verification of `.github/scripts/node-version-alignment.test.mjs` and `.github/scripts/release-token-scope.test.mjs` against staged edits: 7/7 passed.
- Windows CI (`ci.yml`) on `ThienNg65/ferry` PR #190 (`fe97ef439e82b17584bc1c24fe97ef43f6936fa4`): pending at PR creation.

## Rollback Plan
- Revert commit `fe97ef439e82b17584bc1c24fe97ef43f6936fa4` on `ThienNg65/ferry` (`main` if merged) to restore `22.14.0`.

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR #190 passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-004; Approval marker: [TL-APR:APR-TASK-FERRY-004].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-004` or `APPROVED: APR-TASK-FERRY-004`
- **Reject:** comment `/reject APR-TASK-FERRY-004` or `REJECTED: APR-TASK-FERRY-004`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Windows CI pass on `ThienNg65/ferry#190` and Director review.
