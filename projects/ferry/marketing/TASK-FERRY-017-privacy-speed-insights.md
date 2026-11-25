---
doc_id: TASK-FERRY-017
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
  - app/pages/privacy.vue
  - app/pages/privacy.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Disclose Vercel Speed Insights in Website Privacy Policy

## Objective & Background
`ThienNg65/ferry-website#31` identified that `nuxt.config.ts` and `package.json` configure `@vercel/speed-insights` (`^2.1.0`) alongside `@vercel/analytics/nuxt`, while `app/pages/privacy.vue` Section 5 only disclosed Vercel Web Analytics. Updating `privacy.vue` and adding a regression test keeps the website privacy policy aligned with configured measurement integrations. See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-website` branch `fix/31-disclose-speed-insights-privacy`:
    - `app/pages/privacy.vue`: disclose Vercel Speed Insights (Web Vitals including soft-navigation metrics, route/URL, network speed, browser, device type, OS, country, and anonymous non-identifying recording per Vercel docs).
    - `app/pages/privacy.test.ts`: add Vitest regression test verifying every `@vercel/*` module in `nuxt.config.ts` is disclosed in `app/pages/privacy.vue`.
- **Excluded:**
  - `ThienNg65/ferry` (`private-engineering`), `ThienNg65/ferry-release`, Vercel dashboard settings (not accessible from GitHub/sandbox), and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `public` (`ThienNg65/ferry-website` only).
- **Accuracy:** Do not claim individual visitor identification; note that Speed Insights collection depends on Vercel project enablement.

## Expected Deliverables & Acceptance Criteria
- [x] `app/pages/privacy.vue` discloses both Vercel Web Analytics and Vercel Speed Insights.
- [x] `app/pages/privacy.test.ts` checks `nuxt.config.ts` `@vercel/*` modules against `app/pages/privacy.vue`.
- [ ] PR opened in `ThienNg65/ferry-website`.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-017`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-website` PR on branch `fix/31-disclose-speed-insights-privacy`.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-017` (`[TL-APR:APR-TASK-FERRY-017]`).
