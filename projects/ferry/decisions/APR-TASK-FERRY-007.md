---
doc_id: APR-TASK-FERRY-007
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-mkt-lead
related_task_id: TASK-FERRY-007
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-007]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public-release
sources:
  - projects/ferry/marketing/TASK-FERRY-007-refresh-legacy-update-readme.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Refresh Legacy Update Guidance in `ferry-release` README (`TASK-FERRY-007`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-release` branch `docs/refresh-legacy-update-guidance` (`README.md`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-007-refresh-legacy-update-readme.md](../marketing/TASK-FERRY-007-refresh-legacy-update-readme.md)).
- **Reason:** Replace obsolete `v0.18.1` bridge-release instructions in `ThienNg65/ferry-release/README.md` with accurate guidance pointing legacy `v0.18.0` (or earlier) users to install the latest release from `ThienNg65/ferry-release` or the Microsoft Store.

## Expected Impact & Risks
- Prevents legacy users from searching for an obsolete `v0.18.1` bridge release and gives a clear manual fallback if older updaters cannot reach the current feed.
- Low risk: documentation-only change in `README.md`. Note: if an automated README-sync template exists in upstream release workflows, keep it aligned in a separate follow-up.

## Validation Evidence
- Inspected `ThienNg65/ferry-release/README.md` lines 43–48 and verified all links remain strictly `public-release`.
- `ThienLabs` CI (`validate-and-test`) pending on governance PR creation.

## Rollback Plan
- Revert the `README.md` commit on `ThienNg65/ferry-release` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve the `ThienNg65/ferry-release` README PR and matching `ThienNg65/ThienLabs` PR.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-007; Approval marker: [TL-APR:APR-TASK-FERRY-007].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-007` or `APPROVED: APR-TASK-FERRY-007`
- **Reject:** comment `/reject APR-TASK-FERRY-007` or `REJECTED: APR-TASK-FERRY-007`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Director review on `ThienNg65/ferry-release` and `ThienNg65/ThienLabs` PRs.
