---
doc_id: APR-TASK-FERRY-009
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-009
status: approved
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
- **Target:** `ThienNg65/ferry` PR #218 (`https://github.com/ThienNg65/ferry/pull/218`, branch `fix/217-delete-recursive-rethrow`, commit `1d96841a8d4d1ff118b04b9edbd15a8162a50ea9`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-009-delete-recursive-rethrow.md](../development/TASK-FERRY-009-delete-recursive-rethrow.md)).
- **Reason:** Resolve `ThienNg65/ferry#217` by rethrowing `SSH_TIMEOUT` and `CANCELLED` `SshError`s in `RemoteShell.deleteRecursive()` instead of falling back to `deleteRecursiveSftp()`.

## Expected Impact & Risks
- Prevents unbounded SFTP recursive deletion walks after a 5-minute `rm -rf` timeout or user cancellation.
- Low risk: mirrors the existing `RemoteShell.mkdirRecursive()` error guard and preserves fallback for non-timeout/non-cancel exec errors.

## Validation Evidence
- Static inspection of `src/main/ssh/RemoteShell.ts` and `src/main/ssh/RemoteShell.test.ts`.
- Windows CI (`verify`, `CodeQL`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `conventional-title`, `sync-phase`) on `ThienNg65/ferry#218`: all 6 checks passed.
- `ThienLabs` CI (`validate-and-test`, `sync-phase`) on `ThienNg65/ThienLabs#14`: passed.

## Rollback Plan
- Revert commit `1d96841a8d4d1ff118b04b9edbd15a8162a50ea9` on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry#218` passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-009; Approval marker: [TL-APR:APR-TASK-FERRY-009].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-009` or `APPROVED: APR-TASK-FERRY-009`
- **Reject:** comment `/reject APR-TASK-FERRY-009` or `REJECTED: APR-TASK-FERRY-009`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-25T06:40:29Z
- **Notes:** Approved by @ThienNg65 via `APPROVED: APR-TASK-FERRY-009` on `ThienNg65/ThienLabs#14` (2026-11-25T06:40:29Z). Ready for manual merge (not auto-merged).
