---
doc_id: APR-TASK-FERRY-006
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-mkt-lead
related_task_id: TASK-FERRY-006
status: approved
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-006]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public-release
sources:
  - projects/ferry/marketing/TASK-FERRY-006-align-public-privacy-policy.md
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-25"
---

# Director Approval Request: Align Public `ferry-release` Privacy Policy (`TASK-FERRY-006`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-release` PR #6 (`https://github.com/ThienNg65/ferry-release/pull/6`, branch `docs/privacy-policy-public-alignment`, commit `4d5a8402b82d82cb506a59ddba819420df6a3b74`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-006-align-public-privacy-policy.md](../marketing/TASK-FERRY-006-align-public-privacy-policy.md)).
- **Reason:** Remove non-public repository contact links from `ThienNg65/ferry-release/PRIVACY.md` (which 404 for public users), align licensing language with `ferry-release/README.md`, and sync Policy Version `1.1` (`2026-11-23`) with `https://www.ferryssh.com/privacy`.

## Expected Impact & Risks
- Eliminates a public-channel broken/non-public link and brings the public release repository's `PRIVACY.md` into alignment with `ferryssh.com/privacy` v1.1.
- Low risk: documentation-only update; preserves all Ferry Desktop App local-first, DPAPI, update-check, retention, export, and deletion terms.

## Validation Evidence
- Verified `PRIVACY.md` content against `ThienNg65/ferry-website/app/pages/privacy.vue` (v1.1) and `ThienNg65/ferry-release/README.md`.
- `ThienLabs` CI (`validate-and-test`, `sync-phase`) passed.

## Rollback Plan
- Revert commit `4d5a8402b82d82cb506a59ddba819420df6a3b74` in `ThienNg65/ferry-release` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve `ThienNg65/ferry-release#6` and the matching `ThienLabs` PR so public privacy policy links and terms are accurate.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-006; Approval marker: [TL-APR:APR-TASK-FERRY-006].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-006` or `APPROVED: APR-TASK-FERRY-006`
- **Reject:** comment `/reject APR-TASK-FERRY-006` or `REJECTED: APR-TASK-FERRY-006`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-25T01:52:51Z
- **Notes:** Approved by @ThienNg65 via `APPROVED: APR-TASK-FERRY-006` on `ThienNg65/ferry-release#6` (2026-11-25T01:52:14Z) and `APPROVED: APR-TASK-FERRY-006` on `ThienNg65/ThienLabs#11` (2026-11-25T01:52:51Z). Ready for manual merge (not auto-merged).
