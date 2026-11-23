---
doc_id: PRJ-FERRY-GOALS-001
project_id: ferry
department: orchestration
doc_type: goals-and-metrics
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
sources:
  - https://github.com/ThienNg65/ThienLabs/issues/1#section-18
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Ferry Pilot Goals & Validation Metrics

## Phase 1 MVP Validation Checklist (RFC #1 Sec 18)

- [x] 1. Chat-based delegation from Director → Chief of Staff → Ferry department leads.
- [x] 2. Project-specific knowledge isolation (`projects/ferry/` and `private-engineering` vs. `public-marketing` boundaries).
- [x] 3. Structured cross-department collaboration using typed Task Briefs and Handoffs.
- [x] 4. Multi-provider execution compatibility via provider-agnostic agent contracts.
- [x] 5. GitHub workflows aligned with `ferry` (`main` protected, Conventional Commits, Release Please).
- [x] 6. Independent code/PR review before merge readiness. *(Verified on `ferry-website` branch `feat/privacy-vercel-analytics` at `1dda497`)*
- [x] 7. Education-led quality/security audit using evidence-only reporting.
- [x] 8. Human Director Level 3 approval gates on merges, releases, scope, and security changes.
- [x] 9. Consolidated reporting back to Director.

## Product & Delivery Metrics

| Metric | Baseline | Target | Measurement Method |
|---|---|---|---|
| Microsoft Store / GitHub Release adoption | **Store (`9PJPWK568P53`, 2026-11-23):** `10` page views / `0` installs (`2026-10-24`–`2026-11-20`); `9` page views / `2` installs in `48h` (`2026-11-21`–`2026-11-23`). **GitHub (`ferry-release`):** `ferry-v1.3.4` = `5` (`Setup`: 2, `Portable`: 1, `latest.yml`: 2); `v1.3.3` = `6`; `v1.3.2` = `11` | +25% per release cycle | Store Partner Center (`acquisitions`) & `ThienNg65/ferry-release` download stats |
| Website conversion (`ferryssh.com` → Store/Release) | **Vercel Web Analytics (enabled 2026-11-23, ~41m post-deploy):** `1` visitor, `9` page views, `0%` bounce rate; **Speed Insights:** RES `100` (`10` desktop events); **Custom Events:** unavailable on Hobby plan (Pro required) | >5% CTR to Store/Release | Vercel Web Analytics (page views/visitors) + Store Partner Center & `ferry-release` referral/install tracking |
| Automated test & typecheck pass rate on PRs | Current `main` CI green (100%) | 100% before merge | `npm run typecheck`, `npm test`, `npm run build` |
| Escaped release defects | 0 open P0/P1 in `ferry-release` | 0 escaped P0/P1 per release | `ferry-release` issue tracking & retrospectives |
