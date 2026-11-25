---
doc_id: TASK-FERRY-013
project_id: ferry
department: marketing
doc_type: task-brief
owner: ferry-marketing-lead
created_by: org-chief-of-staff
parent_task_id: null
status: active
priority: medium
hop_count: 1
max_hops: 4
approval_stage: level-3
workflow_phase: director-approval
version: "1.0"
access_classification: public
sources:
  - app/assets/css/main.css
  - app/composables/useScrollMotion.ts
  - app/composables/useScrollMotion.test.ts
supersedes: null
created_at: "2026-11-25"
updated_at: "2026-11-25"
target_date: "2026-11-25"
---

# Task Brief: Keep Scroll-Reveal Controls Out of Focus While Hidden

## Objective & Background
`ThienNg65/ferry-website#28` identified an accessibility regression where `html.motion-ready .reveal-pre` and `useSectionReveal` hid offscreen sections with `opacity: 0` alone, leaving interactive controls (such as the `WorkspaceSection` tablist buttons) in keyboard tab order and the accessibility tree while visually transparent. See [project-context.md](../project-context.md) for repository boundaries.

## Scope
- **Included:**
  - `ThienNg65/ferry-website` branch `fix/28-reveal-pre-focus-inert`:
    - `app/assets/css/main.css`: add `visibility: hidden;` alongside `opacity: 0;` on `html.motion-ready .reveal-pre`.
    - `app/composables/useScrollMotion.ts`: restore `autoAlpha` (`opacity` + `visibility`) with `clearProps: 'transform,opacity,visibility'`, apply `inert` via `hideRevealTargets` while targets are hidden, and clear `inert` + `.reveal-pre` via `showRevealTargets` on reveal, reduced-motion, `navigator.webdriver`, and unmount/revert cleanup.
    - `app/composables/useScrollMotion.test.ts`: add Vitest unit tests covering `main.css` `.reveal-pre` visibility and `hideRevealTargets`/`showRevealTargets` lifecycle.
- **Excluded:**
  - Private engineering internals (`ThienNg65/ferry`), release repos, and merging without Level 3 Director approval.

## Requirements & Constraints
- **Classification boundary:** `public` (`ThienNg65/ferry-website` only).
- **Accessibility:** Keyboard navigation and assistive technology must not reach hidden `.reveal-pre` descendants; reduced-motion and cleanup paths must never leave content hidden or `inert`.

## Expected Deliverables & Acceptance Criteria
- [x] `html.motion-ready .reveal-pre` sets `opacity: 0; visibility: hidden;`.
- [x] `useSectionReveal` uses `autoAlpha` + `inert` while hidden and clears both on enter, reduced motion, webdriver, and cleanup.
- [x] Unit test added in `app/composables/useScrollMotion.test.ts`.
- [ ] Level 3 Director approval (`APR-TASK-FERRY-013`) recorded before merge.

## Required Evidence
- `ThienNg65/ferry-website` PR on branch `fix/28-reveal-pre-focus-inert` + CI checks.
- `ThienLabs` `validate-and-test` CI check on the matching governance PR.

## Workflow Phase & Visibility
- **Current phase:** `director-approval`
- **GitHub body metadata:** `Workflow phase: director-approval`

## Approval Gate
- **Required level:** Level 3 (Director Approval) — `APR-TASK-FERRY-013` (`[TL-APR:APR-TASK-FERRY-013]`).
