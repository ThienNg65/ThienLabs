---
doc_id: TASK-FERRY-004
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: low
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - .github/actions/setup-node-deps/action.yml
  - .github/workflows/release.yml
  - package.json
  - CLAUDE.md
  - .github/scripts/node-version-alignment.test.mjs
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
target_date: "2026-11-24"
---

# Task Brief: Align Ferry CI & Release Node.js Version with Dependency Engines

## Objective & Background
Ferry's locked development dependencies (`abbrev@5.0.0` and `nopt@10.0.1` via `@vue/test-utils@2.6.0`) declare `engines.node` as `^22.22.2 || ^24.15.0 || >=26.0.0`, while `.github/actions/setup-node-deps/action.yml` and `.github/workflows/release.yml` (`sync-public-readme`) pinned Node.js `22.14.0`, emitting `EBADENGINE` warnings on every CI run (tracked in `ThienNg65/ferry#173`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `ci/173-align-node-version` (`https://github.com/ThienNg65/ferry/pull/190`, commit `fe97ef439e82b17584bc1c24fe97ef43f6936fa4`):
    - `.github/actions/setup-node-deps/action.yml`: `22.14.0` → `22.23.5`
    - `.github/workflows/release.yml` (`sync-public-readme`): `22.14.0` → `22.23.5`
    - `package.json`: add `"engines": { "node": ">=22.22.2" }`
    - `CLAUDE.md`: document `Requires Node.js >=22.22.2 (CI runs Node v22.23.5).`
    - `.github/scripts/node-version-alignment.test.mjs`: automated alignment check
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging PR #190 without Level 3 Director approval.
  - `.claude/PROJECT_MAP.md` line 19 (`Node v22.14.0`), left untouched in this remote API PR due to its 125 KB file size.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Release scope safety:** Preserve step-scoped `PUBLIC_RELEASE_TOKEN` / `GH_TOKEN` / `LEGACY_TOKEN` isolation verified by `.github/scripts/release-token-scope.test.mjs`.

## Expected Deliverables & Acceptance Criteria
- [x] Composite action and `release.yml` updated to Node `22.23.5` (>= `22.22.2`).
- [x] `package.json` `engines.node` set to `>=22.22.2` and `CLAUDE.md` updated.
- [x] Regression test `.github/scripts/node-version-alignment.test.mjs` added.
- [x] PR opened in `ThienNg65/ferry` (`https://github.com/ThienNg65/ferry/pull/190`).
- [ ] Windows CI (`ci.yml`) passes on PR #190 without `EBADENGINE` warnings.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-004`) recorded before merge.

## Required Evidence
- Scratch run of `node --test` on `node-version-alignment.test.mjs` and `release-token-scope.test.mjs`: 7/7 passed.
- Pending: Windows CI run on `https://github.com/ThienNg65/ferry/pull/190` (`fe97ef439e82b17584bc1c24fe97ef43f6936fa4`).

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-004` (`[TL-APR:APR-TASK-FERRY-004]`).
