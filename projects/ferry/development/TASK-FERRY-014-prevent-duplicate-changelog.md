---
doc_id: TASK-FERRY-014
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - .github/scripts/check-changelog-duplicates.mjs
  - .github/scripts/check-changelog-duplicates.test.mjs
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Prevent Duplicate Changelog Entries from Merge Commits

## Objective & Background
`ThienNg65/ferry#172` reported that Release Please can emit duplicate changelog bullets when a PR is merged with a merge commit whose subject repeats a Conventional Commit prefix already present in the PR's commits (observed in `1.3.2` and `1.3.3` `CHANGELOG.md`). While `1.4.0` and `1.4.1` are clean due to squash merges, CI lacked an automated guard to catch duplicate entries in `CHANGELOG.md` before release. See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/172-prevent-duplicate-changelog`:
    - `.github/scripts/check-changelog-duplicates.mjs`: add automated duplicate-entry detector (`findDuplicateChangelogEntries`) checking normalized subjects and duplicate PR references in the latest release section of `CHANGELOG.md`.
    - `.github/scripts/check-changelog-duplicates.test.mjs`: add unit tests covering subject normalization, merge-commit duplicate detection, duplicate PR-number detection, and repository `CHANGELOG.md` (executed automatically by `ci.yml` via `node --test .github/scripts/*.test.mjs`).
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, rewriting historical `1.3.2`/`1.3.3` `CHANGELOG.md` entries, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Compatibility:** Must pass on Node 18+ / 22.14.0 without external npm dependencies.

## Expected Deliverables & Acceptance Criteria
- [x] `.github/scripts/check-changelog-duplicates.mjs` and `.github/scripts/check-changelog-duplicates.test.mjs` added and passing.
- [x] Existing `ci.yml` `node --test .github/scripts/*.test.mjs` step executes the duplicate-changelog check on every PR.
- [ ] PR opened in `ThienNg65/ferry` and Windows CI (`verify`) passes.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-014`) recorded before merge.

## Required Evidence
- Local run of `node --test .github/scripts/check-changelog-duplicates.test.mjs` (4/4 passed) and `node .github/scripts/check-changelog-duplicates.mjs`.
- `ThienNg65/ferry` PR on branch `fix/172-prevent-duplicate-changelog` + Windows CI run.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-014` (`[TL-APR:APR-TASK-FERRY-014]`).
