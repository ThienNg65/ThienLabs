---
doc_id: APR-TASK-FERRY-011
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-011
status: approved
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-011]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-011-validate-ipc-payloads.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Validate History, Operations, and Window IPC Payloads (`TASK-FERRY-011`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` PR #229 (`https://github.com/ThienNg65/ferry/pull/229`, branch `fix/207-validate-ipc-payloads`, commit `523f68d176f780b9bdb1af180dc5abea5577cfe4`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-011-validate-ipc-payloads.md](../development/TASK-FERRY-011-validate-ipc-payloads.md)).
- **Reason:** Resolve `ThienNg65/ferry#207` by enforcing runtime `VALIDATION` checks and `ipc.validation_rejected` security logging on `history:list`, `operation:cancel`, and `window:syncTheme`.

## Expected Impact & Risks
- Prevents malformed `history:list` queries, non-string/empty `operation:cancel` IDs, and invalid `window:syncTheme` payloads from reaching handlers or surfacing as `UNKNOWN`.
- Low risk: existing valid callers are unaffected; `operations.ipc.test.ts` updated from testing `String(123)` coercion to testing `VALIDATION` rejection.

## Validation Evidence
- Static inspection of `validation.ts`, `history.ipc.ts`, `operations.ipc.ts`, `window.ipc.ts`, `contract.ts`, and IPC test suites.
- Windows CI (`verify`, `CodeQL`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `conventional-title`, `sync-phase`) on `ThienNg65/ferry#229`: all 6 checks passed.
- `ThienLabs` CI (`validate-and-test`, `sync-phase`) on `ThienNg65/ThienLabs#16`: passed.

## Rollback Plan
- Revert commit `523f68d176f780b9bdb1af180dc5abea5577cfe4` on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry#229` passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-011; Approval marker: [TL-APR:APR-TASK-FERRY-011].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-011` or `APPROVED: APR-TASK-FERRY-011`
- **Reject:** comment `/reject APR-TASK-FERRY-011` or `REJECTED: APR-TASK-FERRY-011`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-25T06:39:12Z
- **Notes:** Approved by @ThienNg65 via `APPROVED: APR-TASK-FERRY-011` on `ThienNg65/ThienLabs#16` (2026-11-25T06:39:12Z). Ready for manual merge (not auto-merged).
