---
doc_id: DOC-FERRY-APPROVAL-AUTOMATION
project_id: ferry
department: orchestration
doc_type: automation-runbook
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
sources:
  - .github/workflows/phase-tags.yml
  - .github/workflows/director-approval.yml
  - .github/workflows/agent-event-bridge.yml
  - .github/workflows/ferry-daily-audit.yml
  - src/ledger.ts
  - src/dispatch.ts
created_at: "2026-11-24"
updated_at: "2026-11-24"
---

# Ferry Phase & Director Approval Automation

## 1. Phase labels

GitHub labels are the canonical visible phase tags. PR titles in Ferry repositories must remain Conventional Commit compliant; do not prepend phase tags to PR titles.

| Phase | GitHub label | Meaning |
|---|---|---|
| Intake | `phase:intake` | New request, triage, duplicate check |
| Discovery | `phase:discovery` | Requirements, UX, feasibility, product decision |
| Implementation | `phase:implementation` | Engineering work and PR preparation |
| QA | `phase:qa` | Functional verification and independent review |
| Director approval | `phase:director-approval` | Explicit Level 3 decision required |
| Release | `phase:release` | Release readiness, publication, distribution |

Every issue/PR body should include:

- Workflow phase: `implementation` (replace with the current phase)
- Approval ID: `N/A` (or the exact `APR-<TASK-ID>` when approval is required)

The phase-label workflow mirrors that metadata to the matching GitHub label. It also supports an optional `[FERRY:QA]` tag in issue titles, but PR titles must not be changed.

## 2. Director approval marker

A Level 3 checkpoint must include all of the following:

- Workflow phase: `director-approval`
- Approval ID: one exact `APR-<TASK-ID>`
- Approval marker: `[TL-APR:APR-<TASK-ID>]`
- Labels: `phase:director-approval` and `approval:required`

Example PR body:

```markdown
Workflow phase: director-approval
Approval ID: APR-TASK-FERRY-004
Approval marker: [TL-APR:APR-TASK-FERRY-004]
```

Do not place the phase marker at the beginning of a PR title. Preserve titles such as `fix(tabs): restore site manager after keyboard close`.

## 3. How the Director approves

Only the authenticated repository owner (currently `ThienNg65`) can release a gate.

Supported approval actions:

- Submit a GitHub PR review with state **Approve** on a PR carrying `approval:required` and the exact APR marker.
- Comment on the tagged issue/PR with `/approve APR-TASK-FERRY-004`.
- Or comment with `APPROVED: APR-TASK-FERRY-004`.

Rejection:

- `/reject APR-TASK-FERRY-004`
- Or `REJECTED: APR-TASK-FERRY-004`

A plain `approved`, emoji reaction, approval from another account, approval on an untagged item, or a comment with the wrong APR ID does not count.

## 4. What happens after approval

1. GitHub verifies the comment/review author is the repository owner.
2. The workflow verifies the exact APR ID and pending `approval:required` label.
3. The approval workflow is serialized per GitHub issue/PR, then removes `approval:required`, adds `approval:approved` (or `approval:rejected`), and records an audit comment.
4. An idempotent `repository_dispatch` event named `thienlabs-director-decision` is emitted with the APR ID, task ID, decision, actor, target URL, and timestamp.
5. `agent-event-bridge.yml` preserves the event as a 30-day artifact and forwards it to a configured ThienLabs agent runner.
6. The task runner resumes only the task associated with that APR ID. Rejected tasks remain stopped.

The runtime ledger now permits the transition `paused_for_approval → approved → dispatched`, so a local agent runner can resume the same task after `thienlabs approve --task <TASK-ID> --decision approved`.

Approval releases only the exact action described in the approval request. It does not bypass CI, branch protection, independent review, or another separate Level 3 gate. The workflow does not auto-merge or publish releases by itself.

## 5. Configure the agent runner

The GitHub event bridge can forward events to the real ThienLabs execution service, but the runner endpoint must be configured.

For each repository that should forward agent events (`ThienLabs`, `ferry`, `ferry-release`, and `ferry-website`):

1. Open **Settings → Secrets and variables → Actions → Variables**.
2. Add `THIENLABS_AGENT_RUNNER_URL` with the HTTPS endpoint that accepts ThienLabs event JSON.
3. Under **Secrets**, add `THIENLABS_AGENT_RUNNER_TOKEN` with the bearer token expected by that endpoint.

The bridge sends the full GitHub `repository_dispatch` event using an Authorization Bearer header. The runner should validate the token, repository, event type, APR/task ID, and idempotency before execution.

Until those two values are configured, GitHub still verifies and records approvals, queues events, and uploads event manifests, but no AI provider is invoked. The runtime currently prepares provider-neutral prompts; it does not yet contain a hosted agent execution adapter.

## 6. Daily audit queue

`ferry-daily-audit.yml` runs daily at 08:00 Asia/Ho_Chi_Minh and can also be started manually. It creates or reuses a same-day audit issue in ThienLabs, applies `phase:qa` and `automation:queued`, then emits a `thienlabs-task-request` event covering:

- `ThienNg65/ferry`
- `ThienNg65/ferry-release`
- `ThienNg65/ferry-website`

The audit task is read-only. Findings must be evidence-backed and deduplicated before issue creation. It must not implement fixes during the audit.

Without a configured runner, the daily audit is queued but not executed. This prevents a scheduled GitHub issue from being misrepresented as a completed AI audit.

## 7. Operational safeguards

- Only one current phase label should be active on an issue/PR.
- Only a unique APR ID can release its matching gate.
- Duplicate approvals are ignored once the required label has been removed.
- Conflicting approved/rejected decisions fail closed.
- Rejections never emit a resume instruction.
- Approval events are auditable through GitHub comments, labels, Actions runs, and event artifacts.
