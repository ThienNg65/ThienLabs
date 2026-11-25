---
doc_id: TASK-FERRY-009
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: approved
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - src/main/ssh/RemoteShell.ts
  - src/main/ssh/RemoteShell.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Rethrow Timeout and Cancel Errors in `RemoteShell.deleteRecursive`

## Objective & Background
Unlike `RemoteShell.mkdirRecursive()`, `RemoteShell.deleteRecursive()` used a bare `catch {}` around `this.exec('rm -rf ...', { timeoutMs: 5 * 60 * 1000 })` and unconditionally fell through to `this.deleteRecursiveSftp(remotePath)`, swallowing `SSH_TIMEOUT` and `CANCELLED` errors and triggering an unbounded per-entry SFTP walk (tracked in `ThienNg65/ferry#217`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/217-delete-recursive-rethrow` (`https://github.com/ThienNg65/ferry/pull/218`, commit `1d96841a8d4d1ff118b04b9edbd15a8162a50ea9`):
    - `src/main/ssh/RemoteShell.ts`: catch `(e)` and rethrow `SshError` when `e.code === 'CANCELLED' || e.code === 'SSH_TIMEOUT'`, matching `mkdirRecursive()`.
    - `src/main/ssh/RemoteShell.test.ts`: add unit tests verifying `SSH_TIMEOUT` and `CANCELLED` rethrow without invoking `deleteRecursiveSftp`, while non-timeout/non-cancel exec errors still fall back.
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Behavior:** `deleteRecursive()` must rethrow `SshError` with code `'SSH_TIMEOUT'` or `'CANCELLED'` and preserve SFTP fallback for non-timeout/non-cancel errors.

## Expected Deliverables & Acceptance Criteria
- [x] `RemoteShell.deleteRecursive()` rethrows `SSH_TIMEOUT` and `CANCELLED` `SshError`s.
- [x] Unit tests added in `src/main/ssh/RemoteShell.test.ts`.
- [x] PR opened in `ThienNg65/ferry` (`https://github.com/ThienNg65/ferry/pull/218`) and Windows CI (`verify`) passes.
- [x] Level 3 Director approval (`APR-TASK-FERRY-009`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry` PR #218 (`1d96841a8d4d1ff118b04b9edbd15a8162a50ea9`) — all 6 CI checks passed.
- `ThienLabs` `validate-and-test` CI check on `ThienNg65/ThienLabs#14` — passed.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-009` (`[TL-APR:APR-TASK-FERRY-009]`).
