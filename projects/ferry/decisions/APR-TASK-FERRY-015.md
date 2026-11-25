---
doc_id: APR-TASK-FERRY-015
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-marketing-lead
related_task_id: TASK-FERRY-015
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-015]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/marketing/TASK-FERRY-015-public-readme-template.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Fix Canonical Public README Legacy Guidance (`TASK-FERRY-015`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` branch `docs/155-fix-public-readme-template` (`docs/public-release-template/README.md`, `.github/scripts/publish-public-release.test.mjs`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-015-public-readme-template.md](../marketing/TASK-FERRY-015-public-readme-template.md)).
- **Reason:** Resolve `ThienNg65/ferry#155` so the canonical public README template and `sync-public-readme` direct legacy users (`v0.18.0` or earlier) to current GitHub Releases and the Microsoft Store rather than the obsolete `v0.18.1` bridge release.

## Expected Impact & Risks
- Prevents `release.yml`'s `sync-public-readme` job from overwriting `ThienNg65/ferry-release/README.md` with obsolete `v0.18.1` instructions.
- Low risk: documentation template and test assertion update only.

## Validation Evidence
- Executed `node --test .github/scripts/publish-public-release.test.mjs` locally: passed (7/7).
- Windows CI (`verify`) on `ThienNg65/ferry` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-015; Approval marker: [TL-APR:APR-TASK-FERRY-015].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-015` or `APPROVED: APR-TASK-FERRY-015`
- **Reject:** comment `/reject APR-TASK-FERRY-015` or `REJECTED: APR-TASK-FERRY-015`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Windows CI pass on `ThienNg65/ferry` PR and Director review.
