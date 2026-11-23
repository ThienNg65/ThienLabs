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

1. **Synthesize before handoff:** Never dump raw multi-file search results or full transcripts into a handoff. Pass a concise synthesized brief + exact file paths, line ranges, or issue/decision IDs.
2. **Typed handoff required:** Use [cross-department-handoff.md](../templates/cross-department-handoff.md) for cross-department transitions and [task-brief.md](../templates/task-brief.md) for delegated work.
3. **Duplicate check first:** Before creating a new task or issue, search existing tasks, issues, and decisions in the project scope. Link duplicates to the canonical record.
4. **Preserve contradictory evidence:** Never silently discard conflicting findings; record both positions with sources and escalate to leads if unresolved.
