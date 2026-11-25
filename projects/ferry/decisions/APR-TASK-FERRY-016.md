---
doc_id: APR-TASK-FERRY-016
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-marketing-lead
related_task_id: TASK-FERRY-016
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-016]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public
sources:
  - projects/ferry/marketing/TASK-FERRY-016-sync-website-docs.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Synchronize Website README (`TASK-FERRY-016`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-website` branch `docs/11-sync-website-docs` (`README.md`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-016-sync-website-docs.md](../marketing/TASK-FERRY-016-sync-website-docs.md)).
- **Reason:** Address `README.md` mismatches tracked in `ThienNg65/ferry-website#11` (`public/screens/` → `public/media/`, `NUXT_PUBLIC_SITE_URL` default `https://www.ferryssh.com`, current test/design doc references).

## Expected Impact & Risks
- Aligns contributor and deployment documentation with actual repository layout and `nuxt.config.ts`.
- Low risk: documentation-only change.

## Validation Evidence
- Verified against `nuxt.config.ts` (`siteUrl: 'https://www.ferryssh.com'`), `public/media/`, and `DESIGN.md` in `ThienNg65/ferry-website`.
- `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry-website` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after reviewing `README.md` diff.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-016; Approval marker: [TL-APR:APR-TASK-FERRY-016].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-016` or `APPROVED: APR-TASK-FERRY-016`
- **Reject:** comment `/reject APR-TASK-FERRY-016` or `REJECTED: APR-TASK-FERRY-016`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director review.
