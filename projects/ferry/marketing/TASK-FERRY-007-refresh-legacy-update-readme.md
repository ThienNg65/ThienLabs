---
doc_id: TASK-FERRY-007
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-mkt-lead
created_by: org-chief-of-staff
parent_task_id: null
status: approved
priority: low
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: public-release
sources:
  - https://github.com/ThienNg65/ferry-release/blob/main/README.md
  - https://github.com/ThienNg65/ferry-release/releases
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Refresh Obsolete `v0.18.1` Migration Guidance in `ferry-release` README

## Objective & Background
`ThienNg65/ferry-release/README.md` instructed users on `v0.18.0` or earlier to upgrade specifically to the obsolete `v0.18.1` bridge release. With current releases on the `1.4.x` line and automatic updates served via `ThienNg65/ferry-release` (`latest.yml`) and Microsoft Store (`9PJPWK568P53`), the legacy upgrade section should direct older installations to install the latest release from `ferry-release` or Microsoft Store without referencing `v0.18.1` as a required bridge version. See [project-context.md](../project-context.md) for public/private isolation boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-release` branch `docs/refresh-legacy-update-guidance` (`https://github.com/ThienNg65/ferry-release/pull/7`, commit `7bbb267c07441193a61372134cdd3f4d5f521e5f`).
- **Excluded:**
  - Any `private-engineering` files, links, or automated release-workflow changes, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** Strictly `public-release`; no `private-engineering` links or internal paths.
- **Canonical channels:** Reference only `ThienNg65/ferry-release` GitHub Releases (`../../releases/latest`, `latest.yml`) and Microsoft Store (`https://apps.microsoft.com/detail/9PJPWK568P53`) as the current update/install channels, with a clear manual fallback if an older updater cannot reach the current feed.

## Expected Deliverables & Acceptance Criteria
- [x] `README.md` no longer tells users that `v0.18.1` is the required current bridge version.
- [x] Canonical download and update channels (`ThienNg65/ferry-release` and Microsoft Store) are documented with a manual fallback.
- [x] PR opened in `ThienNg65/ferry-release` (`https://github.com/ThienNg65/ferry-release/pull/7`).
- [x] Level 3 Director approval (`APR-TASK-FERRY-007`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-release` PR #7 (`7bbb267c07441193a61372134cdd3f4d5f521e5f`).
- `ThienLabs` `validate-and-test` CI check on `ThienNg65/ThienLabs#12`.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-007` (`[TL-APR:APR-TASK-FERRY-007]`).
