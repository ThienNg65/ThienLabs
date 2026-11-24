---
doc_id: GOV-APPROVAL-001
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

# Approval and Autonomy Policy

## Autonomy Levels

| Level | Mode | Permitted Actions | Gate |
|---|---|---|---|
| **Level 1** | Independent execution | Research, analysis, internal docs, draft requirements/strategies, technical investigation, automated tests, read-only audits, planning, recommendations | None (report evidence) |
| **Level 2** | Delegated execution | Within approved scope: create/update issues & task records, prepare PRs, implement approved features, fix validated bugs, update docs, run authorized tests, prepare release candidates | Within approved Task Brief / scope |
| **Level 3** | Director approval required | Merge PRs, deploy to production, publish releases, change strategic direction or expand scope materially, spend money, change security-sensitive settings, modify production data, destructive/irreversible actions, change org-wide policies | Explicit Director sign-off via `approval-request` template |

## Escalation Rules

- Any Level 3 action must stop before execution (`thienlabs complete` pauses to `paused_for_approval` and emits an `APR-*.md` artifact via [approval-request.md](../templates/approval-request.md)), requiring explicit Director sign-off (`thienlabs approve`).
- Every GitHub checkpoint must carry `[FERRY:DIRECTOR-APPROVAL]` and a unique `[TL-APR:APR-...]` title marker, plus `phase:director-approval` and `approval:required` labels.
- The Director may approve with a submitted GitHub `APPROVED` review or an exact comment `/approve APR-...` / `APPROVED: APR-...`; reject with `/reject APR-...` / `REJECTED: APR-...`.
- GitHub identity is part of the signature: only the repository owner/Director account can release a gate. Generic `approved` text, reactions, manual labels from non-Directors, silence, and untagged items do not count.
- Decisions are idempotent and scoped to one exact `APR-*` ID. Approval emits one continuation event; it does not authorize unrelated actions or bypass CI, branch protection, or separate downstream gates.
- Routine, reversible Level 1–2 work within an approved scope should proceed without bottlenecking the Director.
- Approval of an upstream step never auto-approves a downstream Level 3 step (`src/validate.ts` blocks `completed` Level 3 briefs lacking an `approved` `APR-*.md`).
