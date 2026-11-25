---
doc_id: APR-TASK-FERRY-012
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-012
status: approved
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-012]"
required_labels:
  - phase:director-approval
  - approval:approved
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-012-reconcile-version-file.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Reconcile Stale `VERSION` File (`TASK-FERRY-012`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` branch `fix/180-reconcile-version-file` (`VERSION`, `.github/scripts/version-alignment.test.mjs`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-012-reconcile-version-file.md](../development/TASK-FERRY-012-reconcile-version-file.md)).
- **Reason:** Resolve `ThienNg65/ferry#180` by synchronizing `VERSION` (`0.14.15` → `1.4.0`) with `package.json` and `.release-please-manifest.json`, and adding an automated version-alignment CI test.

## Expected Impact & Risks
- Ensures `VERSION` matches all other version markers (`1.4.0`) so Release Please's `extra-files` updater keeps it synchronized on future releases, and catches any drift in CI.
- Low risk: `VERSION` is not read by build/packaging scripts (`package.json` remains canonical).

## Validation Evidence
- Executed `node --test .github/scripts/version-alignment.test.mjs` locally: passed (1/1).
- Windows CI (`verify`) on `ThienNg65/ferry` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-012; Approval marker: [TL-APR:APR-TASK-FERRY-012].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-012` or `APPROVED: APR-TASK-FERRY-012`
- **Reject:** comment `/reject APR-TASK-FERRY-012` or `REJECTED: APR-TASK-FERRY-012`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-25T07:40:45Z
- **Notes:** Approved by `@ThienNg65` via `APPROVED: APR-TASK-FERRY-012` on `ThienNg65/ThienLabs#17`.
