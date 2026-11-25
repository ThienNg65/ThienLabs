---
doc_id: TASK-FERRY-012
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: approved
priority: low
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - VERSION
  - .github/scripts/version-alignment.test.mjs
  - release-please-config.json
  - .release-please-manifest.json
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Reconcile Stale `VERSION` File with Release Please Configuration

## Objective & Background
The root `VERSION` file remained at `0.14.15` while `package.json`, `package-lock.json`, `neutralino.config.json`, and `.release-please-manifest.json` advanced to `1.4.0`. Because `release-please-config.json` lists `VERSION` in `extra-files`, Release Please's generic updater could not match `1.4.0` in `VERSION` and left it stale (tracked in `ThienNg65/ferry#180`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/180-reconcile-version-file`:
    - `VERSION`: update from `0.14.15` to `1.4.0`.
    - `.github/scripts/version-alignment.test.mjs`: add automated test verifying `VERSION`, `package.json`, `package-lock.json`, `neutralino.config.json`, and `.release-please-manifest.json` remain synchronized and `release-please-config.json` includes `VERSION` and `neutralino.config.json` in `extra-files`.
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Consistency:** All tracked version markers must match `1.4.0` on `main`, and CI must detect future drift.

## Expected Deliverables & Acceptance Criteria
- [x] `VERSION` updated to `1.4.0` matching `package.json`, `package-lock.json`, `neutralino.config.json`, and `.release-please-manifest.json`.
- [x] Automated drift check added in `.github/scripts/version-alignment.test.mjs`.
- [x] PR opened in `ThienNg65/ferry` and Windows CI (`verify`) passes.
- [x] Level 3 Director approval (`APR-TASK-FERRY-012`) recorded before merge.

## Required Evidence
- Local run of `node --test .github/scripts/version-alignment.test.mjs` (1/1 passed).
- `ThienNg65/ferry` PR on branch `fix/180-reconcile-version-file` + Windows CI run.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-012` (`[TL-APR:APR-TASK-FERRY-012]`).
