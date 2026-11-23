---
doc_id: TASK-FERRY-001
project_id: ferry
department: product
doc_type: task-brief
owner: ferry-prd-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: high
hop_count: 1
max_hops: 4
approval_stage: level-3
version: "1.0"
access_classification: public-marketing
sources:
  - C:/toys/ferry-dev/ferry-website/PRODUCT.md
  - C:/toys/ferry-dev/ferry-website/nuxt.config.ts
  - C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
target_date: "2026-11-24"
---

# Task Brief: Ferry Website SEO, Accessibility & Privacy-Page Audit (Pilot 001)

## Objective & Background
Execute the Phase 1 live pilot validation on `ferry-website` (`https://www.ferryssh.com`) by auditing SEO metadata, accessibility landmarks, and `/privacy` page accuracy ahead of enabling Vercel Web Analytics for website conversion tracking ([goals-and-metrics.md](../goals-and-metrics.md)).

## Scope
- **Included:** `C:/toys/ferry-dev/ferry-website` (`nuxt.config.ts`, `app/app.vue`, `app/pages/privacy.vue`, `app/composables/useSeoSchema.ts`, `public/robots.txt`, `public/sitemap.xml`).
- **Excluded:** `ThienNg65/ferry` (`private-engineering` source code) and direct production deployment without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** Strictly `public-marketing`; never reference `private-engineering` internals or link `ThienNg65/ferry`.
- **Truthfulness:** If Vercel Web Analytics is enabled on `ferryssh.com`, `/privacy` must clearly distinguish the **Ferry Desktop App** (zero telemetry, zero analytics, local-first) from the **Website** (cookie-free aggregated web analytics).
- **Acceptance Criteria (Given/When/Then):**
  - **Given** a visitor or crawler inspects `ferryssh.com/privacy`, **When** Vercel Web Analytics is enabled, **Then** `/privacy` accurately discloses website analytics while preserving the desktop app's zero-telemetry guarantee.
  - **Given** a screen-reader or keyboard user visits `ferryssh.com`, **When** navigating the page, **Then** skip-to-content link, `<main>` landmark, and table semantics (`scope="col"`/`scope="row"`) are present and verified.

## Expected Deliverables & Acceptance Criteria
- [x] Typed Task Brief issued by Chief of Staff to Product Lead (`ferry-prd-lead`).
- [x] Cross-department handoff to Marketing & Education (`PILOT-001-handoff-audit.md`).
- [x] Independent evidence-only Education audit (`PILOT-001-quality-audit.md`).
- [ ] Level 3 Director decision on `PILOT-001-approval-request.md` before applying `ferry-website` edits.

## Required Evidence
- Exact file paths and line references in `C:/toys/ferry-dev/ferry-website`.
- Independent audit report from `ferry-edu-lead`.

## Approval Gate
- **Required level:** Level 3 (Director Approval) — required before editing/merging `ferry-website` or enabling Vercel Web Analytics.
