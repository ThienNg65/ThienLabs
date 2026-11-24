---
doc_id: DOC-ORG-WF-001
project_id: organization
department: orchestration
doc_type: implementation-plan
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
sources:
  - src/cli.ts
  - src/ledger.ts
  - src/dispatch.ts
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
---

# ThienLabs Workflow & CLI Feature Map

Canonical reference for agents and operators interacting with the `thienlabs` runtime (`node dist/cli.js`).

## CLI Commands

| Command | Purpose | Key Flags | Output / Side Effect |
|---|---|---|---|
| `validate` | Verify YAML frontmatter, links, isolation, `src/` DAG, and zero-workaround rules | `--json` | Exit `0` on pass; `1` with actionable `[CODE]` diagnostics on failure |
| `build-context` | Assemble bounded, classification-filtered context envelope | `--project`, `--agent`, `--brief`, `--max-files`, `--max-chars` | JSON `{ loaded_files, skipped }` |
| `init-project` | Scaffold a new `projects/<id>/` unit and register it | `--id`, `--name`, `--dry-run` | Creates 9 files + updates `project-registry.md` |
| `dispatch` | Validate circuit breakers, build prompt, and record `dispatched` | `--brief`, `--dry-run` | JSON prompt payload + `runtime/ledger.jsonl` |
| `complete` | Validate `ExecutionResult`, handle `handoff` or Level 3 `APR-*` gate | `--brief`, `--result` | Records `completed`, `handoff`, `paused_for_approval`, or `blocked` |
| `retry` | Classify transient failure (`provider\|tool\|permission\|context\|ambiguity`) | `--brief`, `--failure-class`, `--summary` | Records `retried` or `escalated` at `retry_count >= 2` |
| `approve` | Record Director decision on a paused Level 3 task | `--task`, `--decision`, `--notes` | Updates `APR-*.md` + appends `approved` / `rejected` |
| `status` | Inspect latest task states in `runtime/ledger.jsonl` | `--project`, `--task` | JSON array of latest `LedgerEvent` per task |

## Canonical Task & Approval Statechart

```mermaid
stateDiagram-v2
    [*] --> dispatched : "thienlabs dispatch"
    dispatched --> completed : "complete (level-1/2)"
    dispatched --> handoff : "complete (handoff, hop+1 < max_hops)"
    dispatched --> paused_for_approval : "complete (level-3 / needs_approval)"
    dispatched --> retried : "retry (< 2)"
    dispatched --> blocked : "complete (blocked)"
    dispatched --> escalated : "hop >= max_hops"

    handoff --> dispatched : "next owner dispatch"
    handoff --> blocked : "retry limit reached"
    handoff --> escalated : "hop >= max_hops"

    retried --> completed
    retried --> handoff
    retried --> paused_for_approval
    retried --> retried : "retry (< 2)"
    retried --> escalated : "retries >= 2"

    paused_for_approval --> approved : "thienlabs approve --decision approved"
    paused_for_approval --> rejected : "thienlabs approve --decision rejected"

    completed --> [*]
    approved --> [*]
    rejected --> [*]
    blocked --> [*]
    escalated --> [*]
```
