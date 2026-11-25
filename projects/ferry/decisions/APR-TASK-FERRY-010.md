---
doc_id: APR-TASK-FERRY-010
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-010
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-010]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-010-sites-backup-validation.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Surface Sites Backup Validation Errors (`TASK-FERRY-010`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` branch `fix/220-sites-backup-validation-error` (`src/main/sites/sitesBackup.ts`, `src/main/ipc/sites.ipc.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-010-sites-backup-validation.md](../development/TASK-FERRY-010-sites-backup-validation.md)).
- **Reason:** Resolve `ThienNg65/ferry#220` by throwing `SshError('VALIDATION', ...)` in `parseSitesBackup()` so `sites:importJson` surfaces specific validation error messages instead of generic `UNKNOWN` errors.

## Expected Impact & Risks
- Gives users actionable error messages when importing invalid or malformed sites backup JSON files.
- Low risk: `SshError` extends `Error`, preserving existing error message semantics for any non-IPC callers.

## Validation Evidence
- Static inspection of `src/main/sites/sitesBackup.ts`, `src/main/ipc/sites.ipc.ts`, and `src/main/ipc/sites.ipc.test.ts`.
- Windows CI (`verify`) on `ThienNg65/ferry` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-010; Approval marker: [TL-APR:APR-TASK-FERRY-010].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-010` or `APPROVED: APR-TASK-FERRY-010`
- **Reject:** comment `/reject APR-TASK-FERRY-010` or `REJECTED: APR-TASK-FERRY-010`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Windows CI pass on `ThienNg65/ferry` PR and Director review.
