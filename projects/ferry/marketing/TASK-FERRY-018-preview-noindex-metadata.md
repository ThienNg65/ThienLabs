---
doc_id: TASK-FERRY-018
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-marketing-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: public
sources:
  - nuxt.config.ts
  - app/utils/metadata.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Emit `noindex, nofollow` on Vercel Preview Deployments

## Objective & Background
`ThienNg65/ferry-website#2` requires that production builds use canonical `https://www.ferryssh.com` metadata while preview deployments do not advertise themselves as indexable canonical pages. `nuxt.config.ts` already sets `siteUrl: 'https://www.ferryssh.com'` and `og:image` / `twitter:image`, but hardcoded `<meta name="robots" content="index, follow, ...">` unconditionally. Gating `robots` on `process.env.VERCEL_ENV === 'preview'` ensures preview builds emit `noindex, nofollow`. See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-website` branch `fix/2-preview-noindex-metadata`:
    - `nuxt.config.ts`: set `<meta name="robots">` to `'noindex, nofollow'` when `process.env.VERCEL_ENV === 'preview'`, keeping `'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'` for production.
    - `app/utils/metadata.test.ts`: add Vitest regression test verifying `https://www.ferryssh.com` across `nuxt.config.ts`, `public/robots.txt`, and `public/sitemap.xml`, plus the `VERCEL_ENV === 'preview'` `noindex, nofollow` gate.
- **Excluded:**
  - `ThienNg65/ferry` (`private-engineering`), `ThienNg65/ferry-release`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `public` (`ThienNg65/ferry-website` only).

## Expected Deliverables & Acceptance Criteria
- [x] `nuxt.config.ts` emits `noindex, nofollow` when `VERCEL_ENV === 'preview'`.
- [x] `app/utils/metadata.test.ts` covers canonical domain and preview `noindex` behavior.
- [ ] PR opened in `ThienNg65/ferry-website`.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-018`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-website` PR on branch `fix/2-preview-noindex-metadata` + Vercel preview build.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-018` (`[TL-APR:APR-TASK-FERRY-018]`).
