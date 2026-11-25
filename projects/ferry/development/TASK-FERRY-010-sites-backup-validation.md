---
doc_id: TASK-FERRY-010
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - src/main/sites/sitesBackup.ts
  - src/main/ipc/sites.ipc.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Surface Sites Backup Validation Errors Instead of Generic `UNKNOWN`

## Objective & Background
`parseSitesBackup()` in `src/main/sites/sitesBackup.ts` threw plain `Error` instances for invalid JSON, unsupported schema versions, and malformed site fields. Because `envelope.ts` maps plain `Error`s to `UNKNOWN` and `src/sidecar/protocol.ts` strips `UNKNOWN` messages to `'The operation failed unexpectedly'`, importing an invalid sites backup hid the specific validation failure message from the UI (tracked in `ThienNg65/ferry#220`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/220-sites-backup-validation-error`:
    - `src/main/sites/sitesBackup.ts`: throw `SshError('VALIDATION', ...)` from `parseSitesBackup()`.
    - `src/main/ipc/sites.ipc.test.ts`: add unit tests verifying `sites:importJson` rejects invalid JSON and malformed site fields with `IpcErrorCode` `'VALIDATION'` and preserves the specific `parseSitesBackup()` message.
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Behavior:** Invalid JSON, unsupported schema versions, and malformed site fields must reject with `SshError('VALIDATION', ...)` and preserve their exact validation message across the IPC envelope.

## Expected Deliverables & Acceptance Criteria
- [x] `parseSitesBackup()` throws `SshError('VALIDATION', ...)` for invalid JSON, schema errors, and per-site validation errors.
- [x] Regression test added in `src/main/ipc/sites.ipc.test.ts`.
- [ ] PR opened in `ThienNg65/ferry` and Windows CI (`verify`) passes.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-010`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry` PR on branch `fix/220-sites-backup-validation-error` + Windows CI run.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-010` (`[TL-APR:APR-TASK-FERRY-010]`).
