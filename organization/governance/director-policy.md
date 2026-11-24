---
doc_id: GOV-DIRECTOR-001
project_id: organization
department: governance
doc_type: policy
owner: director
status: active
version: "1.0"
access_classification: internal
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Director Policy

## Authority

The human owner acts as **Director** and holds final authority over:

1. Organization vision, strategic priorities, and project goals.
2. Project lifecycle: creating, authorizing, pausing, and terminating projects.
3. Material product direction, business decisions, and scope changes outside delegated authority.
4. All Level 3 gated actions (PR merges, production releases, spending, security-sensitive changes, and destructive actions).
5. Resolving escalated cross-department conflicts and reviewing organizational performance.

## Operating Rules

- The Director interacts primarily through natural-language conversation with the **Chief of Staff**.
- Approving investigation, design, or implementation **never** implies approval for downstream PR merge, deployment, or release.
- Agents must not treat silence, incomplete context, or open PRs as Director approval.
- For a tagged GitHub checkpoint, the Director's authenticated `APPROVED` review or exact `/approve APR-...` / `APPROVED: APR-...` comment is the signature. It releases only the matching approval request and emits a resumable workflow event.
- Approval does not bypass unrelated approvals, CI, branch protection, validation, or a separate release/security gate.
- Agents must distinguish verified facts, observed evidence, assumptions, and unverified hypotheses in all reports to the Director.
