---
doc_id: APR-TASK-FERRY-017
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-marketing-lead
related_task_id: TASK-FERRY-017
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-017]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public
sources:
  - projects/ferry/marketing/TASK-FERRY-017-privacy-speed-insights.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Disclose Vercel Speed Insights in Website Privacy Policy (`TASK-FERRY-017`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-website` branch `fix/31-disclose-speed-insights-privacy` (`app/pages/privacy.vue`, `app/pages/privacy.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-017-privacy-speed-insights.md](../marketing/TASK-FERRY-017-privacy-speed-insights.md)).
- **Reason:** Resolve `ThienNg65/ferry-website#31` by disclosing the configured `@vercel/speed-insights` integration alongside `@vercel/analytics/nuxt` in `app/pages/privacy.vue` and adding a regression test in `app/pages/privacy.test.ts`.

## Expected Impact & Risks
- Aligns `ferryssh.com/privacy` with the measurement integrations configured in `nuxt.config.ts`.
- Low risk: policy copy update and Vitest module-disclosure test; note that Vercel dashboard Speed Insights enablement state was not inspected from the sandbox.

## Validation Evidence
- Verified `nuxt.config.ts` (`@vercel/analytics/nuxt`, `@vercel/speed-insights`) against `app/pages/privacy.vue`.
- `ThienLabs` `validate-and-test` CI and Vercel preview pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry-website` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Confirm Speed Insights toggle state in Vercel project settings and approve if Speed Insights remains enabled.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-017; Approval marker: [TL-APR:APR-TASK-FERRY-017].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-017` or `APPROVED: APR-TASK-FERRY-017`
- **Reject:** comment `/reject APR-TASK-FERRY-017` or `REJECTED: APR-TASK-FERRY-017`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director review and Vercel dashboard Speed Insights confirmation.
