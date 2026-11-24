---
doc_id: GOV-COMM-001
project_id: organization
department: governance
doc_type: policy
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Agent Communication Protocol

## Collaboration Model (Hybrid)

- **Peer-to-peer:** Allowed for routine technical clarification, data lookups, evidence sharing, and review feedback within the same project.
- **Department Leads:** Coordinate cross-department scope, priorities, ownership, dependencies, and conflicts.
- **Director Escalation:** Required for Level 3 approvals, strategic trade-offs, major scope changes, critical risks, and unresolved material conflicts.

## Context Envelope Rule (Search & Handoff Hygiene)

To prevent context bloat and semantic drift across agent transitions:

1. **Synthesize before handoff:** Never dump raw multi-file search results into a handoff. Pass a concise synthesized brief + exact file paths, line ranges, or issue/decision IDs (`thienlabs build-context` enforces token budgets).
2. **Typed handoff required:** Use `thienlabs complete` (`status: "handoff"`) to emit a validated [cross-department-handoff.md](../templates/cross-department-handoff.md) artifact (`HND-*.md`) and enforce `max_handoff_hops: 4`.
3. **Duplicate check first:** Check `thienlabs status` and existing project tasks/issues before opening new work.
4. **Preserve contradictory evidence:** Never silently discard conflicting findings; record both positions with sources and escalate to leads if unresolved.
