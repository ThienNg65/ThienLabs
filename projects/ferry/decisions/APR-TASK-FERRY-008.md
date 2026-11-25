---
doc_id: APR-TASK-FERRY-008
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-008
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-008]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: private-engineering
sources:
  - projects/ferry/development/TASK-FERRY-008-bookmark-delete-guard.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Guard Non-Array Bookmarks in `BookmarkStore.deleteForSite` (`TASK-FERRY-008`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry` branch `fix/208-bookmark-delete-for-site-guard` (`src/main/bookmarks/BookmarkStore.ts`, `src/main/bookmarks/BookmarkStore.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-008-bookmark-delete-guard.md](../development/TASK-FERRY-008-bookmark-delete-guard.md)).
- **Reason:** Resolve `ThienNg65/ferry#208` by routing `BookmarkStore.deleteForSite()` through `this.list()` so non-array `bookmarks.json` data does not throw a `TypeError` during `sites:delete`.

## Expected Impact & Risks
- Prevents `sites:delete` failures on corrupted or non-array `bookmarks.json` entries.
- Low risk: `this.list()` already performs `Array.isArray(stored) ? stored : []` and is used by `create()`, `copyEndpointToSite()`, and `delete()`.

## Validation Evidence
- Static inspection of `src/main/bookmarks/BookmarkStore.ts` and `src/main/bookmarks/BookmarkStore.test.ts`.
- Windows CI (`verify`) on `ThienNg65/ferry` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry` PR passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-008; Approval marker: [TL-APR:APR-TASK-FERRY-008].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-008` or `APPROVED: APR-TASK-FERRY-008`
- **Reject:** comment `/reject APR-TASK-FERRY-008` or `REJECTED: APR-TASK-FERRY-008`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting Windows CI pass on `ThienNg65/ferry` PR and Director review.
