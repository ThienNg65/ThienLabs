---
doc_id: APR-TASK-FERRY-008
project_id: ferry
department: development
doc_type: approval-request
requested_by: ferry-eng-lead
related_task_id: TASK-FERRY-008
status: approved
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
- **Target:** `ThienNg65/ferry` PR #210 (`https://github.com/ThienNg65/ferry/pull/210`, branch `fix/208-bookmark-delete-for-site-guard`, commit `95d34d12c21cece3f3b52d982c472123d81a7bbd`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-008-bookmark-delete-guard.md](../development/TASK-FERRY-008-bookmark-delete-guard.md)).
- **Reason:** Resolve `ThienNg65/ferry#208` by routing `BookmarkStore.deleteForSite()` through `this.list()` so non-array `bookmarks.json` data does not throw a `TypeError` during `sites:delete`.

## Expected Impact & Risks
- Prevents `sites:delete` failures on corrupted or non-array `bookmarks.json` entries.
- Low risk: `this.list()` already performs `Array.isArray(stored) ? stored : []` and is used by `create()`, `copyEndpointToSite()`, and `delete()`.

## Validation Evidence
- Static inspection of `src/main/bookmarks/BookmarkStore.ts` and `src/main/bookmarks/BookmarkStore.test.ts`.
- Windows CI (`verify`, `CodeQL`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `conventional-title`, `sync-phase`) on `ThienNg65/ferry#210`: all 6 checks passed.
- `ThienLabs` CI (`validate-and-test`, `sync-phase`) on `ThienNg65/ThienLabs#13`: passed.

## Rollback Plan
- Revert commit `95d34d12c21cece3f3b52d982c472123d81a7bbd` on `ThienNg65/ferry` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after Windows CI on `ThienNg65/ferry#210` passes.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-008; Approval marker: [TL-APR:APR-TASK-FERRY-008].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-008` or `APPROVED: APR-TASK-FERRY-008`
- **Reject:** comment `/reject APR-TASK-FERRY-008` or `REJECTED: APR-TASK-FERRY-008`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** approved
- **Decision timestamp:** 2026-11-25T02:59:24Z
- **Notes:** Approved by @ThienNg65 via `APPROVED: APR-TASK-FERRY-008` on `ThienNg65/ferry#210` (2026-11-25T02:59:24Z). Ready for manual merge (not auto-merged).
