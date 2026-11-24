---
doc_id: TASK-FERRY-006
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-mkt-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: high
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: public-release
sources:
  - https://github.com/ThienNg65/ferry-release/blob/main/PRIVACY.md
  - https://github.com/ThienNg65/ferry-release/blob/main/README.md
  - https://github.com/ThienNg65/ferry-website/blob/main/app/pages/privacy.vue
  - https://github.com/ThienNg65/ferry-release/pull/6
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
target_date: "2026-11-24"
---

# Task Brief: Align Public `ferry-release` Privacy Policy with Public Channel Boundaries and v1.1

## Objective & Background
`ThienNg65/ferry-release/PRIVACY.md` (`Policy Version: 1.0`, `2026-11-14`) contained non-public contact links that 404 for public users, stale `open-source (MIT-licensed)` phrasing conflicting with `ferry-release/README.md`, and lacked the `ferryssh.com` cookie-free Vercel Web Analytics disclosure published in `ferry-website` (`Policy Version: 1.1`, `2026-11-23`). See [project-context.md](../project-context.md) for public/private isolation boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-release` branch `docs/privacy-policy-public-alignment` (`https://github.com/ThienNg65/ferry-release/pull/6`, commit `4d5a8402b82d82cb506a59ddba819420df6a3b74`):
    - Update `PRIVACY.md` contact links to `https://github.com/ThienNg65/ferry-release/issues` and `https://www.ferryssh.com/privacy`.
    - Align licensing wording with `ferry-release/README.md` (`Historical source releases were distributed under the MIT License (see LICENSE); downloading a packaged installer does not change rights already granted to earlier source releases.`).
    - Bump `Effective Date` to `2026-11-23` and `Policy Version` to `1.1`, adding Section 5 (`Website Analytics (ferryssh.com)`) matching `ferry-website/app/pages/privacy.vue`.
- **Excluded:**
  - Any `private-engineering` files, `ferry-website` source edits, or merging `ThienNg65/ferry-release#6` without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** Strictly `public-release`; no private-engineering links or internal paths.
- **Accuracy:** Preserve all desktop-app local-first, Windows DPAPI, optional `ferry-release` update check, retention, export, and deletion statements.

## Expected Deliverables & Acceptance Criteria
- [x] `PRIVACY.md` contact links point exclusively to `ThienNg65/ferry-release/issues` and `https://www.ferryssh.com/privacy`.
- [x] Licensing wording matches `ferry-release/README.md` and `https://www.ferryssh.com/terms`.
- [x] Policy Version `1.1` (`2026-11-23`) and `ferryssh.com` Vercel Web Analytics disclosure match `ferry-website/app/pages/privacy.vue`.
- [x] PR opened in `ThienNg65/ferry-release` (`https://github.com/ThienNg65/ferry-release/pull/6`).
- [ ] Level 3 Director approval (`APR-TASK-FERRY-006`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-release` PR #6 (`4d5a8402b82d82cb506a59ddba819420df6a3b74`).
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-006` (`[TL-APR:APR-TASK-FERRY-006]`).
