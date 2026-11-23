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
- [ ] 6. Independent code/PR review before merge readiness. *(Pending `ferry-website` PR after Level 3 approval of `APR-FERRY-001`)*
- [x] 7. Education-led quality/security audit using evidence-only reporting.
- [x] 8. Human Director Level 3 approval gates on merges, releases, scope, and security changes.
- [x] 9. Consolidated reporting back to Director.

## Product & Delivery Metrics

| Metric | Baseline | Target | Measurement Method |
|---|---|---|---|
| Microsoft Store / GitHub Release adoption | TBD (capture from Store Partner Center + `gh release view`) | +25% per release cycle | Store Partner Center & `ferry-release` download stats |
| Website conversion (`ferryssh.com` → Store/Release) | Not yet instrumented (Vercel Web Analytics to be enabled) | >5% CTR to Store/Release | Vercel Web Analytics (privacy-friendly) + Store/Release referral tracking |
| Automated test & typecheck pass rate on PRs | Current `main` CI green (100%) | 100% before merge | `npm run typecheck`, `npm test`, `npm run build` |
| Escaped release defects | 0 open P0/P1 in `ferry-release` | 0 escaped P0/P1 per release | `ferry-release` issue tracking & retrospectives |
