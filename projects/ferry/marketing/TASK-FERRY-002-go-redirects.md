---
doc_id: TASK-FERRY-002
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-mkt-lead
created_by: org-chief-of-staff
parent_task_id: null
status: completed
priority: high
hop_count: 1
max_hops: 4
approval_stage: level-3
version: "1.0"
access_classification: public-marketing
sources:
  - C:/toys/ferry-dev/ferry-website/nuxt.config.ts
  - C:/toys/ferry-dev/ferry-website/app/utils/release.ts
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
target_date: "2026-11-24"
---

# Task Brief: Add `/go/store` and `/go/download` Redirect Routes for Vercel Hobby Analytics

## Objective & Background
Vercel Web Analytics on the Hobby plan does not support Custom Events (`@vercel/analytics` `track()`), so outbound clicks to Microsoft Store and GitHub Releases are not measured. Adding internal `/go/store` and `/go/download` routes on `ferryssh.com` turns outbound CTA clicks into measurable first-party route hits before redirecting to the destination ([goals-and-metrics.md](../goals-and-metrics.md)).

## Scope
- **Included:** `C:/toys/ferry-dev/ferry-website` (`server/routes/go/...` or Nuxt route handlers, plus CTA links in `app/` that point to Microsoft Store or GitHub Releases).
- **Excluded:** `ThienNg65/ferry` (`private-engineering`), Vercel Pro upgrade, and pushing/merging to `main` without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** Strictly `public-marketing`; never reference `private-engineering` internals or link `ThienNg65/ferry`.
- **Canonical targets:**
  - `/go/store` → `https://apps.microsoft.com/detail/9PJPWK568P53`
  - `/go/download` → `https://github.com/ThienNg65/ferry-release/releases/latest` (or dynamic/latest installer URL if appropriate, preserving existing fallback behavior).
- **SEO & Prerender:** Ensure `/go/*` routes are not indexed (`X-Robots-Tag: noindex, nofollow`), are excluded from `sitemap.xml` / prerender crawl if needed, and return a clean `302` redirect.
- **Acceptance Criteria (Given/When/Then):**
  - **Given** a visitor clicks a Microsoft Store or GitHub Download CTA on `ferryssh.com`, **When** the browser navigates to `/go/store` or `/go/download`, **Then** the server responds with `302` to the canonical Store or `ferry-release` URL with `X-Robots-Tag: noindex, nofollow`.
  - **Given** `ferry-website` is built (`npm run build`) and tested (`npm test`), **When** changes are complete, **Then** build and all unit tests pass.

## Expected Deliverables & Acceptance Criteria
- [x] Redirect routes `/go/store` and `/go/download` implemented in `C:/toys/ferry-dev/ferry-website`.
- [x] Outbound Store and GitHub Download CTAs in `app/` updated to route through `/go/store` and `/go/download` (or documented if any must remain direct).
- [x] `npm run build` and `npm test` pass in `C:/toys/ferry-dev/ferry-website`.
- [x] Level 3 Director approval requested before committing/pushing/deploying `ferry-website`.

## Approval Gate
- **Required level:** Level 3 (Director Approval) — required before committing/merging/deploying `ferry-website` changes.
