---
doc_id: HND-FERRY-001
project_id: ferry
department: marketing-to-education
doc_type: cross-department-handoff
from_agent: ferry-mkt-lead
to_agent: ferry-edu-lead
related_task_id: TASK-FERRY-001
hop_count: 2
max_hops: 4
status: completed
version: "1.0"
access_classification: public-marketing
sources:
  - C:/toys/ferry-dev/ferry-website/PRODUCT.md
  - C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue
  - C:/toys/ferry-dev/ferry-website/app/composables/useSeoSchema.ts
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Cross-Department Handoff: Ferry Website SEO, Accessibility & Privacy Audit

## Purpose & Ownership Transfer
- **Purpose:** Hand off `ferry-website` SEO, accessibility, and `/privacy` alignment findings from Product/Marketing to Education Lead for independent evidence-only verification before requesting Level 3 Director approval.
- **Ownership transfer:** `ferry-mkt-lead` → `ferry-edu-lead`

## Context Envelope (Synthesized Brief)
- **Classification:** `public-marketing` only (`ferry-website` + `ferry-release`); no `private-engineering` internals accessed or exposed.
- **Key change driver:** Director selected Vercel Web Analytics to measure `ferryssh.com` → Store/Release conversion (>5% CTR target).
- **Primary gap flagged by Product/Marketing:** `app/pages/privacy.vue` currently states *"zero analytics"* without separating the desktop app (zero telemetry) from the website (if Vercel Web Analytics is enabled).
- **Secondary items:** Verify `useSeoSchema.ts` fallback `softwareVersion` (`1.3.3`), `sitemap.xml` coverage, and `app.vue` / `privacy.vue` accessibility landmarks.

## Cited Sources & Evidence
- `C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue`: Lines 6, 55, 60 state zero analytics; lines 69–85 render the 3-column local storage table.
- `C:/toys/ferry-dev/ferry-website/app/composables/useSeoSchema.ts`: Lines 4–74 define `WebSite`, `SoftwareApplication`, and `FAQPage` JSON-LD schemas.
- `C:/toys/ferry-dev/ferry-website/public/sitemap.xml`: Lists 7 prerendered routes matching `nuxt.config.ts`.

## Required Action & Expected Deliverable
- **Action needed:** Perform an independent read-only audit of the cited `ferry-website` files and record verified findings with severity and confidence.
- **Expected deliverable:** [PILOT-001-quality-audit.md](../education/PILOT-001-quality-audit.md)
