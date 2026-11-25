---
doc_id: TASK-FERRY-015
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-marketing-lead
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
  - docs/public-release-template/README.md
  - .github/scripts/publish-public-release.test.mjs
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Fix Legacy Update Guidance in Canonical Public README Template

## Objective & Background
`ThienNg65/ferry#155` noted that `docs/public-release-template/README.md` still instructed users on `v0.18.0` or earlier to upgrade to the obsolete `v0.18.1` bridge release, causing `publish-public-release.mjs --sync-readme` to overwrite manual corrections in `ThienNg65/ferry-release`. Updating the canonical template and adding a regression assertion prevents `--sync-readme` from reintroducing the stale guidance. See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `docs/155-fix-public-readme-template`:
    - `docs/public-release-template/README.md`: direct legacy (`v0.18.0` or earlier) users to the latest release on GitHub Releases or the Microsoft Store.
    - `.github/scripts/publish-public-release.test.mjs`: assert the obsolete `v0.18.1 bridge release` text is absent and the GitHub Releases / Microsoft Store links are present.
- **Excluded:**
  - `ThienNg65/ferry-website`, direct pushes to `ferry-release` `main`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (source template lives in `ThienNg65/ferry`; output synced to `ThienNg65/ferry-release` must contain no private links).

## Expected Deliverables & Acceptance Criteria
- [x] Canonical `docs/public-release-template/README.md` updated with current GitHub Releases and Microsoft Store migration guidance.
- [x] Regression test added in `.github/scripts/publish-public-release.test.mjs` and passing locally (7/7).
- [ ] PR opened in `ThienNg65/ferry` and Windows CI (`verify`) passes.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-015`) recorded before merge.

## Required Evidence
- Local run of `node --test .github/scripts/publish-public-release.test.mjs` (7/7 passed).
- `ThienNg65/ferry` PR on branch `docs/155-fix-public-readme-template` + Windows CI run.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-015` (`[TL-APR:APR-TASK-FERRY-015]`).
