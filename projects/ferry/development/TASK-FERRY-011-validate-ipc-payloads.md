---
doc_id: TASK-FERRY-011
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
  - src/main/ipc/validation.ts
  - src/main/ipc/history.ipc.ts
  - src/main/ipc/operations.ipc.ts
  - src/main/ipc/window.ipc.ts
  - src/main/ipc/history.ipc.test.ts
  - src/main/ipc/operations.ipc.test.ts
  - src/main/ipc/window.ipc.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Validate History, Operations, and Window IPC Payloads

## Objective & Background
`history.ipc.ts` cast `query as HistoryQuery | undefined` without validating `status`, `search`, or `limit`; `operations.ipc.ts` coerced `operationId` with `String(operationId)` instead of `requireNonEmptyString`; and `window.ipc.ts` threw plain `Error`s instead of `SshError('VALIDATION', ...)` with `ipc.validation_rejected` security logging (tracked in `ThienNg65/ferry#207`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/207-validate-ipc-payloads`:
    - `src/main/ipc/validation.ts`: export `failValidation()`.
    - `src/main/ipc/history.ipc.ts`: validate `query` object, `status`, `search`, and positive integer `limit`.
    - `src/main/ipc/operations.ipc.ts`: validate `operationId` via `requireNonEmptyString()`.
    - `src/main/ipc/window.ipc.ts`: use `failValidation()` for invalid `theme` and `captionColor`.
    - `src/main/ipc/history.ipc.test.ts`, `operations.ipc.test.ts`, `window.ipc.test.ts`: add `VALIDATION` rejection coverage.
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Behavior:** Malformed payloads on `history:list`, `operation:cancel`, and `window:syncTheme` must reject with `IpcErrorCode` `'VALIDATION'` and emit `ipc.validation_rejected`.

## Expected Deliverables & Acceptance Criteria
- [x] `history:list`, `operation:cancel`, and `window:syncTheme` validate incoming payloads and reject with `VALIDATION`.
- [x] Unit tests added across `history.ipc.test.ts`, `operations.ipc.test.ts`, and `window.ipc.test.ts`.
- [ ] PR opened in `ThienNg65/ferry` and Windows CI (`verify`) passes.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-011`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry` PR on branch `fix/207-validate-ipc-payloads` + Windows CI run.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-011` (`[TL-APR:APR-TASK-FERRY-011]`).
