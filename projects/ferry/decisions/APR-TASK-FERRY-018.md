---
doc_id: APR-TASK-FERRY-018
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-marketing-lead
related_task_id: TASK-FERRY-018
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-018]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public
sources:
  - projects/ferry/marketing/TASK-FERRY-018-preview-noindex-metadata.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Emit `noindex, nofollow` on Preview Deployments (`TASK-FERRY-018`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-website` branch `fix/2-preview-noindex-metadata` (`nuxt.config.ts`, `app/utils/metadata.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-018-preview-noindex-metadata.md](../marketing/TASK-FERRY-018-preview-noindex-metadata.md)).
- **Reason:** Address `ThienNg65/ferry-website#2` by preventing Vercel preview deployments (`VERCEL_ENV === 'preview'`) from emitting `index, follow` in `<meta name="robots">`.

## Expected Impact & Risks
- Ensures preview builds emit `<meta name="robots" content="noindex, nofollow">` while production builds retain full indexing metadata.
- Low risk: single environment-conditional metadata string and unit test.

## Validation Evidence
- Verified `nuxt.config.ts`, `public/robots.txt`, and `public/sitemap.xml` in `ThienNg65/ferry-website`.
- `ThienLabs` `validate-and-test` CI and Vercel preview pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry-website` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Vercel preview build succeeds.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-018; Approval marker: [TL-APR:APR-TASK-FERRY-018].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-018` or `APPROVED: APR-TASK-FERRY-018`
- **Reject:** comment `/reject APR-TASK-FERRY-018` or `REJECTED: APR-TASK-FERRY-018`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director review.
