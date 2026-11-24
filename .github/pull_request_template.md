## Workflow metadata

Workflow phase: implementation
Approval ID: N/A
Approval marker: N/A
Related issue/task:
Project:

> Keep the PR title in Conventional Commit format. Workflow phases are displayed using GitHub labels, not title prefixes.

## Summary

## Validation evidence

- [ ] Tests
- [ ] Typecheck / build
- [ ] Independent Education review (when required)

## Director approval checkpoint

For a Level 3 action:
1. Set Workflow phase to `director-approval`.
2. Replace Approval ID with the exact `APR-<TASK-ID>`.
3. Set Approval marker to `[TL-APR:APR-<TASK-ID>]`.
4. Ensure labels `phase:director-approval` and `approval:required` are present.

The Director can submit an **Approve** PR review or comment `/approve APR-<TASK-ID>` / `APPROVED: APR-<TASK-ID>`. Rejection uses `/reject APR-<TASK-ID>` or `REJECTED: APR-<TASK-ID>`.
