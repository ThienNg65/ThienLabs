---
doc_id: APR-FERRY-001
project_id: ferry
department: orchestration
doc_type: approval-request
requested_by: org-chief-of-staff
related_task_id: TASK-FERRY-001
status: pending
version: "1.0"
access_classification: internal
sources:
  - projects/ferry/product/PILOT-001-task-brief.md
  - projects/ferry/marketing/PILOT-001-handoff-audit.md
  - projects/ferry/education/PILOT-001-quality-audit.md
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Director Approval Request: Update `ferry-website` `/privacy` & Enable Vercel Web Analytics

## Proposed Action & Exact Scope
- **Action type:** Scope change / Website content & analytics configuration (Level 3 Director Gate)
- **Target:** `C:/toys/ferry-dev/ferry-website` (`app/pages/privacy.vue`, `package.json` / `app/app.vue` for `@vercel/analytics`, and optional `useSeoSchema.ts` fallback check)
- **Reason:** Instrument `ferryssh.com` → Store/Release conversion metric (`>5% CTR` target in [goals-and-metrics.md](../goals-and-metrics.md)) using privacy-friendly Vercel Web Analytics, while keeping `/privacy` 100% accurate by separating Desktop App (zero telemetry) from Website (cookie-free Vercel Web Analytics).

## Expected Impact & Risks
- **Impact:** Enables privacy-friendly conversion measurement on `ferryssh.com` and resolves High-severity finding `F-001` before analytics go live.
- **Risks:** If Vercel Web Analytics is enabled in the Vercel dashboard before `privacy.vue` is updated and deployed, `/privacy` would temporarily overstate "zero analytics" for website visitors.

## Validation Evidence
- [PILOT-001-task-brief.md](../product/PILOT-001-task-brief.md) (Product scope & acceptance criteria)
- [PILOT-001-handoff-audit.md](../marketing/PILOT-001-handoff-audit.md) (Marketing → Education context-envelope handoff, `hop_count: 2/4`)
- [PILOT-001-quality-audit.md](../education/PILOT-001-quality-audit.md) (Education independent audit: `F-001` High, `F-002` Low, `F-003` Info, `F-004` Verified)

## Rollback Plan
- Revert the `ferry-website` commit and disable Vercel Web Analytics in the Vercel project dashboard.

## Alternatives & Recommendation
- **Recommendation:** **Approve** updating `privacy.vue` + adding `@vercel/analytics` in a PR on `ferry-website`, followed by PR verification (`npm run build`) before merging.

## Director Decision
- **Status:** pending
- **Decision timestamp:** 2026-11-23
- **Notes:** Awaiting Director decision to proceed with `ferry-website` implementation PR.
