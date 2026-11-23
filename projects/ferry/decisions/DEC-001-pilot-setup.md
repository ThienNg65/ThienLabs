---
doc_id: DEC-FERRY-001
project_id: ferry
department: orchestration
doc_type: decision-record
owner: chief-of-staff
status: accepted
version: "1.0"
access_classification: internal
sources:
  - https://github.com/ThienNg65/ThienLabs/issues/1
  - C:/toys/ferry-dev/ferry/CLAUDE.md
  - C:/toys/ferry-dev/ferry-website/PRODUCT.md
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# DEC-FERRY-001: Markdown-First MVP & Ferry 3-Repo Isolation

## Context & Problem
ThienLabs needs to operationalize [RFC #1](https://github.com/ThienNg65/ThienLabs/issues/1) with Ferry as the first pilot unit, while respecting Ferry's split across private engineering (`ferry`) and public distribution/marketing (`ferry-release`, `ferry-website`).

## Options Considered
1. **Markdown + GitHub-first (5 MVP agents, 8 core templates):** Zero custom runtime code; runnable immediately by AI coding agents; enforces search hierarchy, context envelopes, and hop circuit breakers via governance + typed frontmatter.
2. **Custom orchestrator runtime from Day 1:** Programmatic enforcement of permissions and routing, but adds upfront engineering cost before workflows are validated.

## Decision & Rationale
Adopt **Option 1** for Phase 1 (matching RFC #1 Sec 8.1 & Sec 18), scoping Ferry into `projects/ferry/` with explicit `private-engineering` vs. `public-release`/`public-marketing` classification rules.

## Consequences & Risks
- **Benefit:** Immediate pilot execution with minimal maintenance overhead.
- **Risk:** Access isolation and `max_handoff_hops: 4` rely on agent adherence to governance prompts until runtime enforcement is introduced in Phase 2–3.
