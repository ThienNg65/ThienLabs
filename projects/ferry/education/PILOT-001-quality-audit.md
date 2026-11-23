---
doc_id: AUD-FERRY-001
project_id: ferry
department: education
doc_type: quality-audit-report
owner: ferry-edu-lead
status: completed
version: "1.0"
access_classification: internal
sources:
  - C:/toys/ferry-dev/ferry-website/app/app.vue
  - C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue
  - C:/toys/ferry-dev/ferry-website/app/composables/useSeoSchema.ts
  - C:/toys/ferry-dev/ferry-website/nuxt.config.ts
  - C:/toys/ferry-dev/ferry-website/public/robots.txt
  - C:/toys/ferry-dev/ferry-website/public/sitemap.xml
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Quality Audit Report: Ferry Website SEO, Accessibility & Privacy Page

## Executive Summary
- **Scope:** `C:/toys/ferry-dev/ferry-website` (`nuxt.config.ts`, `app/app.vue`, `app/pages/privacy.vue`, `app/composables/useSeoSchema.ts`, `public/robots.txt`, `public/sitemap.xml`).
- **Methodology:** Direct read-only file inspection of source, metadata, ARIA/HTML semantics, and SEO schema definitions.

## Systems Inspected & Commands Executed
- **Files inspected:**
  - `C:/toys/ferry-dev/ferry-website/nuxt.config.ts` (lines 1–64)
  - `C:/toys/ferry-dev/ferry-website/app/app.vue` (lines 1–15)
  - `C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue` (lines 1–105)
  - `C:/toys/ferry-dev/ferry-website/app/composables/useSeoSchema.ts` (lines 1–118)
  - `C:/toys/ferry-dev/ferry-website/public/robots.txt` (lines 1–4)
  - `C:/toys/ferry-dev/ferry-website/public/sitemap.xml` (lines 1–45)
- **Commands executed:** `Get-ChildItem` on `app` and `public` → verified 7 prerendered routes match `sitemap.xml`. (No build/test run in `ferry-website` during read-only audit.)

## Findings

| ID | Title | Category | Severity | Confidence | Status |
|---|---|---|---|---|---|
| F-001 | `/privacy` "zero analytics" claim conflicts with planned Vercel Web Analytics | Compliance / Accuracy | High | High | Resolved (`1dda497`) |
| F-002 | `useSeoSchema.ts` hardcodes `'1.3.3'` fallback `softwareVersion` | SEO | Low | High | Resolved (`1dda497`) |
| F-003 | `privacy.vue` `localStorageRows` tuple carries unused `_purpose` field | Code Quality | Info | High | Resolved (`1dda497`) |
| F-004 | Skip-link, `<main>` landmark, breadcrumb `<nav>`, and `sitemap.xml` are properly configured | Accessibility / SEO | Info | High | Verified |

### F-001: `/privacy` "zero analytics" claim conflicts with planned Vercel Web Analytics
- **Affected component:** `C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue:6,55,60`
- **Evidence / Reproduction:** Lines 6, 55, and 60 state *"zero telemetry, zero cookies, zero analytics"* and *"We do not operate backend servers, user accounts, analytics, or advertising networks."* Enabling Vercel Web Analytics on `ferryssh.com` without updating `/privacy` would make the policy inaccurate for website visitors.
- **Recommendation:** Separate **Ferry Desktop App** (zero telemetry, zero analytics, local-first) from **`ferryssh.com` Website** (cookie-free, privacy-friendly Vercel Web Analytics if enabled).

### F-002: `useSeoSchema.ts` hardcodes `'1.3.3'` fallback `softwareVersion`
- **Affected component:** `C:/toys/ferry-dev/ferry-website/app/composables/useSeoSchema.ts:21`
- **Evidence / Reproduction:** `softwareVersion: version || '1.3.3'` falls back to `'1.3.3'` when runtime version is unavailable. Verify whether `useLatestRelease` supplies the current version at build/prerender time, or keep fallback updated on releases.

### F-003: `privacy.vue` `localStorageRows` tuple carries unused `_purpose` field
- **Affected component:** `C:/toys/ferry-dev/ferry-website/app/pages/privacy.vue:31-38,79`
- **Evidence / Reproduction:** `v-for="[name, loc, _purpose, protection] in localStorageRows"` discards the 3rd tuple element. Either render a Purpose column or simplify to a 3-element tuple.

### F-004: Skip-link, `<main>` landmark, breadcrumb `<nav>`, and `sitemap.xml` are properly configured
- **Affected component:** `app/app.vue:7,9`, `app/pages/privacy.vue:44,69-76`, `public/robots.txt:1-4`, `public/sitemap.xml:1-45`
- **Evidence / Reproduction:** `app.vue` renders `<a href="#main" class="skip-link">` and `<main id="main">`; `privacy.vue` uses `<nav aria-label="Breadcrumb">`, `role="region" aria-label="Local data storage table" tabindex="0"`, and `<th scope="col">` / `<th scope="row">`; `sitemap.xml` covers all 7 routes in `nuxt.config.ts` `nitro.prerender.routes`.
