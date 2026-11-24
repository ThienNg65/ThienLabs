---
doc_id: TASK-FERRY-003
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-mkt-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
version: "1.0"
access_classification: public-marketing
sources:
  - C:/toys/ferry-dev/ferry-website/nuxt.config.ts
  - C:/toys/ferry-dev/ferry-website/app/components/DownloadPanel.vue
  - C:/toys/ferry-dev/ferry-release/README.md
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
target_date: "2026-11-24"
---

# Task Brief: Integrate Official Microsoft Store Badges on `ferry-website` and `ferry-release`

## Objective & Background
Integrate the official Microsoft Store web component badge (`<ms-store-badge productid="9pjpwk568p53">`) on `ferry-website` and the official Microsoft Store app badge in `ferry-release/README.md` to boost trust and Store install conversion while preserving `/go/store` analytics tracking on primary CTA buttons.

## Scope
- **Included:**
  - `C:/toys/ferry-dev/ferry-website` (`nuxt.config.ts`, `app/components/DownloadPanel.vue`)
  - `C:/toys/ferry-dev/ferry-release/README.md`
- **Excluded:** `ThienNg65/ferry` (`private-engineering`) and pushing/merging to `main` without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** Strictly `public-marketing` / `public-release`; never reference `private-engineering` internals.
- **Custom element & script loading:** Configure `vue.compilerOptions.isCustomElement` for `ms-store-badge` in `nuxt.config.ts` and load `https://get.microsoft.com/badge/ms-store-badge.bundled.js` (`type="module"`) via `useHead` in `DownloadPanel.vue`.
- **Language consistency:** Use `language="en-us"` on `ferryssh.com` (`htmlAttrs.lang = 'en'`) while keeping `/go/store` on existing CTA buttons.
- **README badge:** Add `<a href="https://get.microsoft.com/installer/download/9pjpwk568p53?referrer=appbadge" target="_self"><img src="https://get.microsoft.com/images/en-us%20dark.svg" width="200" alt="Get it from Microsoft" /></a>` to `C:/toys/ferry-dev/ferry-release/README.md`.

## Expected Deliverables & Acceptance Criteria
- [ ] `<ms-store-badge>` integrated and rendering in `DownloadPanel.vue` without Vue custom-element warnings.
- [ ] Microsoft Store badge added to `C:/toys/ferry-dev/ferry-release/README.md`.
- [ ] `npm test` and `npm run build` pass in `C:/toys/ferry-dev/ferry-website`.
- [ ] Live browser check confirms `<ms-store-badge>` is present in `#download`.
- [ ] Level 3 Director approval requested before committing/pushing.

## Approval Gate
- **Required level:** Level 3 (Director Approval) — required before committing/pushing `ferry-website` and `ferry-release` changes.
