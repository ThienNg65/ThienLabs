---
doc_id: TASK-FERRY-016
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-marketing-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: public
sources:
  - README.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Synchronize Website README with Current Media, Tests, and Site URL Default

## Objective & Background
`ThienNg65/ferry-website#11` tracks keeping website documentation aligned with actual implementation. Inspection of `README.md` against `nuxt.config.ts` and `public/` showed stale references to `public/screens/` (actual directory is `public/media/` with dark/light WebP captures and `ferry-launch-demo-35s.mp4`), an outdated `npm test` description, and an outdated `NUXT_PUBLIC_SITE_URL` note (whereas `nuxt.config.ts` defaults `siteUrl` to `https://www.ferryssh.com`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-website` branch `docs/11-sync-website-docs`:
    - `README.md`: update media directory (`public/media/`), test description, `NUXT_PUBLIC_SITE_URL` default (`https://www.ferryssh.com`), and reference `DESIGN.md`.
- **Excluded:**
  - `ThienNg65/ferry` (`private-engineering`), `ThienNg65/ferry-release`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `public` (`ThienNg65/ferry-website` only).

## Expected Deliverables & Acceptance Criteria
- [x] `README.md` updated to match `public/media/`, `nuxt.config.ts` `siteUrl`, and current `DESIGN.md` / test suite.
- [ ] PR opened in `ThienNg65/ferry-website`.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-016`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-website` PR on branch `docs/11-sync-website-docs`.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-016` (`[TL-APR:APR-TASK-FERRY-016]`).
