---
doc_id: APR-TASK-FERRY-002
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-mkt-lead
related_task_id: TASK-FERRY-002
status: approved
version: "1.0"
access_classification: public-marketing
sources: []
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
---

# Director Approval Request: TASK-FERRY-002

## Proposed Action & Exact Scope
- **Action type:** Level 3 Director Approval
- **Target:** TASK-FERRY-002
- **Reason:** Added /go/store and /go/download noindex redirect pages with a 250ms @vercel/analytics beacon delay and updated all Store CTAs and All releases links in ferry-website. Vitest (27/27) and Nuxt production build (18 routes prerendered) passed.

## Expected Impact & Risks
- Routes Store and GitHub Release CTA clicks through `/go/store` and `/go/download` (`noindex, nofollow`) so Vercel Hobby Web Analytics records outbound conversions. Risk: 250ms beacon delay before redirect; mitigated by preserving direct fallback URLs.

## Validation Evidence
- C:/toys/ferry-dev/ferry-website/app/components/GoRedirect.vue
- C:/toys/ferry-dev/ferry-website/app/pages/go/store.vue
- C:/toys/ferry-dev/ferry-website/app/pages/go/download.vue
- C:/toys/ferry-dev/ferry-website/app/utils/release.ts
- C:/toys/ferry-dev/ferry-website/app/components/HeroSection.vue
- C:/toys/ferry-dev/ferry-website/app/components/DownloadPanel.vue
- C:/toys/ferry-dev/ferry-website/app/components/PromoVideoModal.vue
- C:/toys/ferry-dev/ferry-website/app/pages/vs/[competitor].vue
- npm --prefix C:/toys/ferry-dev/ferry-website test: 27/27 passed
- npm --prefix C:/toys/ferry-dev/ferry-website run build: 18 routes prerendered including /go/store and /go/download

## Rollback Plan
- Revert the `ferry-website` commit restoring direct Store/GitHub Release hrefs and deleting `app/pages/go/` and `GoRedirect.vue`.

## Alternatives & Recommendation
- **Recommendation:** Review evidence and approve or reject via `thienlabs approve --task TASK-FERRY-002`.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-24
- **Notes:** Approved by Director
