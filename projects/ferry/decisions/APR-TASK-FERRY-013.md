---
doc_id: APR-TASK-FERRY-013
project_id: ferry
department: marketing
doc_type: approval-request
requested_by: ferry-marketing-lead
related_task_id: TASK-FERRY-013
status: pending
workflow_phase: director-approval
origin_phase: implementation
github_approval_marker: "[TL-APR:APR-TASK-FERRY-013]"
required_labels:
  - phase:director-approval
  - approval:required
version: "1.0"
access_classification: public
sources:
  - projects/ferry/marketing/TASK-FERRY-013-reveal-focus-inert.md
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
---

# Director Approval Request: Keep Scroll-Reveal Controls Out of Focus While Hidden (`TASK-FERRY-013`)

## Proposed Action & Exact Scope
- **Action type:** PR merge (Level 3 Director Approval)
- **Target:** `ThienNg65/ferry-website` branch `fix/28-reveal-pre-focus-inert` (`app/assets/css/main.css`, `app/composables/useScrollMotion.ts`, `app/composables/useScrollMotion.test.ts`) and matching `ThienNg65/ThienLabs` governance record ([TASK-FERRY-013-reveal-focus-inert.md](../marketing/TASK-FERRY-013-reveal-focus-inert.md)).
- **Reason:** Resolve `ThienNg65/ferry-website#28` so offscreen `.reveal-pre` sections (including `WorkspaceSection` tablist buttons) are non-focusable (`visibility: hidden` + `inert`) until revealed, while preserving immediate visibility for `prefers-reduced-motion: reduce`.

## Expected Impact & Risks
- Fixes WCAG 2.4.3 / 2.4.7 keyboard-focus and screen-reader exposure on hidden scroll-reveal sections.
- Low risk: `inert` and inline styles are cleared on `onEnter`/`onStart`, `prefers-reduced-motion: reduce`, `navigator.webdriver`, and unmount/revert.

## Validation Evidence
- `app/composables/useScrollMotion.test.ts` added; CI on `ThienNg65/ferry-website` PR and `ThienLabs` `validate-and-test` CI pending on PR creation.

## Rollback Plan
- Revert the commit on `ThienNg65/ferry-website` (`main` if merged).

## Alternatives & Recommendation
- **Recommendation:** Approve after `ThienNg65/ferry-website` PR checks pass.

## GitHub Approval Controls
- **PR/issue body metadata:** Workflow phase: director-approval; Approval ID: APR-TASK-FERRY-013; Approval marker: [TL-APR:APR-TASK-FERRY-013].
- **PR title:** Preserve Conventional Commit format; do not prepend workflow tags.
- **Required labels:** `phase:director-approval`, `approval:required`
- **Approve:** comment `/approve APR-TASK-FERRY-013` or `APPROVED: APR-TASK-FERRY-013`
- **Reject:** comment `/reject APR-TASK-FERRY-013` or `REJECTED: APR-TASK-FERRY-013`
- A GitHub `APPROVED` review counts only when submitted by the Director on this explicitly tagged item while `approval:required` is present.

## Director Decision
- **Status:** pending
- **Decision timestamp:** pending
- **Notes:** Awaiting `ThienNg65/ferry-website` PR checks and Director review.
