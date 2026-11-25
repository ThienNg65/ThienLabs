---
doc_id: TASK-FERRY-008
project_id: ferry
department: development
doc_type: task-brief
owner: ferry-eng-lead
created_by: org-chief-of-staff
parent_task_id: null
status: approved
priority: low
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: private-engineering
sources:
  - src/main/bookmarks/BookmarkStore.ts
  - src/main/bookmarks/BookmarkStore.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Guard Non-Array Bookmarks in `BookmarkStore.deleteForSite`

## Objective & Background
`BookmarkStore.list()` guards against a corrupted or non-array `bookmarks` entry in `conf` using `Array.isArray(stored) ? stored : []`, whereas `BookmarkStore.deleteForSite()` called `this.store.get('bookmarks').filter(...)` directly, throwing a `TypeError` during `sites:delete` if `bookmarks.json` holds a non-array value (tracked in `ThienNg65/ferry#208`). See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry` branch `fix/208-bookmark-delete-for-site-guard` (`https://github.com/ThienNg65/ferry/pull/210`, commit `95d34d12c21cece3f3b52d982c472123d81a7bbd`):
    - `src/main/bookmarks/BookmarkStore.ts`: use `this.list().filter(...)` in `deleteForSite()`.
    - `src/main/bookmarks/BookmarkStore.test.ts`: add regression test for non-array `bookmarks` in `deleteForSite()`.
- **Excluded:**
  - `ThienNg65/ferry-release`, `ThienNg65/ferry-website`, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `private-engineering` (internal to `ThienNg65/ferry` and `ThienNg65/ThienLabs`).
- **Behavior:** `deleteForSite()` must not throw when `bookmarks` on disk is not an array and must preserve existing behavior for valid local and other-site bookmarks.

## Expected Deliverables & Acceptance Criteria
- [x] `BookmarkStore.deleteForSite()` uses `this.list()` instead of raw `this.store.get('bookmarks')`.
- [x] Regression test added in `src/main/bookmarks/BookmarkStore.test.ts`.
- [x] PR opened in `ThienNg65/ferry` (`https://github.com/ThienNg65/ferry/pull/210`) and Windows CI (`verify`) passes.
- [x] Level 3 Director approval (`APR-TASK-FERRY-008`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry` PR #210 (`95d34d12c21cece3f3b52d982c472123d81a7bbd`) — all 6 CI checks passed.
- `ThienLabs` `validate-and-test` CI check on `ThienNg65/ThienLabs#13` — passed.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-008` (`[TL-APR:APR-TASK-FERRY-008]`).
