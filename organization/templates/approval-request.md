---
doc_id: APR-<PROJECT>-001
project_id: <project-id>
department: <department>
doc_type: approval-request
requested_by: <agent-id>
related_task_id: <TASK-ID>
status: pending
workflow_phase: director-approval
origin_phase: <intake|discovery|implementation|qa|release>
github_approval_marker: "[TL-APR:APR-<TASK-ID>]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: internal
sources: []
supersedes: null
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---

# Director Approval Request: <Action Summary>

## Proposed Action & Exact Scope
- **Action type:** PR merge / Release / Scope change / Security change / Spend / Destructive action
- **Target:** <Repo, branch, version, or resource>
- **Reason:** <Why this is requested>

## Expected Impact & Risks
- <User/system impact and key risks>

## Validation Evidence
- <Observed test, build, review, and audit outputs with file/command references>

## Rollback Plan
- <How to revert safely if something fails>

## Alternatives & Recommendation
- **Recommendation:** <Approve / Defer / Alternative>

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-<TASK-ID>; Approval marker: [TL-APR:APR-<TASK-ID>].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-<TASK-ID>` or `APPROVED: APR-<TASK-ID>`
- **Reject:** comment `/reject APR-<TASK-ID>` or `REJECTED: APR-<TASK-ID>`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending / approved / rejected
- **Decision timestamp:** YYYY-MM-DD
- **Notes:** <Director comments>
