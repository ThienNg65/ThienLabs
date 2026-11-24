---
doc_id: APR-TASK-FERRY-003
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-mkt-lead
related_task_id: TASK-FERRY-003
status: approved
version: "1.0"
access_classification: public-marketing
sources: []
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
---

# Director Approval Request: TASK-FERRY-003

## Proposed Action & Exact Scope
- **Action type:** Level 3 Director Approval
- **Target:** TASK-FERRY-003
- **Reason:** Integrated <ms-store-badge productid="9pjpwk568p53" language="en-us"> into ferry-website DownloadPanel.vue (with custom element compiler config in nuxt.config.ts) while preserving /go/store CTA tracking, and added the Microsoft Store app badge to ferry-release/README.md. Vitest (27/27), Nuxt build (18 routes), and live browser check passed.

## Expected Impact & Risks
- Requires Director review before proceeding.

## Validation Evidence
- C:/toys/ferry-dev/ferry-website/nuxt.config.ts
- C:/toys/ferry-dev/ferry-website/app/components/DownloadPanel.vue
- C:/toys/ferry-dev/ferry-release/README.md
- npm --prefix C:/toys/ferry-dev/ferry-website test: 27/27 passed
- npm --prefix C:/toys/ferry-dev/ferry-website run build: 18 routes prerendered
- Live browser check on http://127.0.0.1:3099/#download: <ms-store-badge> rendered at 380.53x104px, ms-store-badge.bundled.js HTTP 200, primary Store buttons retain href=/go/store

## Rollback Plan
- No external state modified; reject request to cancel.

## Alternatives & Recommendation
- **Recommendation:** Review evidence and approve or reject via `thienlabs approve --task TASK-FERRY-003`.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-24
- **Notes:** Approved by Director
