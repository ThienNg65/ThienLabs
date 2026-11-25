---
doc_id: APR-TASK-FERRY-009
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-009
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-009]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-009-delete-recursive-rethrow.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Rethrow Timeout and Cancel Errors in `RemoteShell.deleteRecursive` (`TASK-FERRY-009`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` branch `fix/217-delete-recursive-rethrow` (`src/main/ssh/RemoteShell.ts`, `src/main/ssh/RemoteShell.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-009-delete-recursive-rethrow.md](../development/TASK-FERRY-009-delete-recursive-rethrow.md)).
- **Reason:** Resolve `ThienNg65/ferry#217` by rethrowing `SSH_TIMEOUT` and `CANCELLED` `SshError`s in `RemoteShell.deleteRecursive()` instead of falling back to `deleteRecursiveSftp()`.

## Expected Impact & Risks
- Prevents unbounded SFTP recursive deletion walks after a 5-minute `rm -rf` timeout or user cancellation.
- Low risk: mirrors the existing `RemoteShell.mkdirRecursive()` error guard and preserves fallback for non-timeout/non-cancel exec errors.

## Validation Evidence
- Static inspection of `src/main/ssh/RemoteShell.ts` and `src/main/ssh/RemoteShell.test.ts`.
- Windows CI (`verify`) on `ThienNg65/ferry` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-009; Approval marker: [TL-APR:APR-TASK-FERRY-009].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-009` or `APPROVED: APR-TASK-FERRY-009`
- **Reject:** comment `/reject APR-TASK-FERRY-009` or `REJECTED: APR-TASK-FERRY-009`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Windows CI pass on `ThienNg65/ferry` PR and Director review.
