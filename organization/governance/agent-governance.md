---
doc_id: GOV-AGENT-001
project_id: organization
department: governance
doc_type: policy
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Agent Governance & Planning Guardrails

## Agent Contract Schema

Agent contracts are enforced programmatically by `src/contracts.ts` (`assertAgentContract`) and `thienlabs validate`. Every agent definition must declare valid YAML frontmatter matching [agent-definition.md](../templates/agent-definition.md), including `access_classification` (`public` | `public-marketing` | `public-release` | `internal` | `private-engineering` | `restricted`) and `permissions` (`read`, `write`, `execute`, `external_action`).

## Planning & Execution Guardrails

1. **One Accountable Owner:** Every task has exactly one accountable owner at any point in time.
2. **Complexity-First Routing:** Do not spin up multi-agent orchestration for `Simple` requests.
3. **Runtime-Enforced Circuit Breakers (`src/ledger.ts` / `src/dispatch.ts`):**
   - `max_handoff_hops: 4` per task chain (auto-escalates via `thienlabs complete`).
   - `max_step_retries: 2` with classified failure cause (`provider | tool | permission | context | ambiguity`) via `thienlabs retry`.
   - **Stop-and-replan:** If a core assumption in a Task Brief contradicts observed code/evidence, stop and update the plan.
4. **Evidence-Only Completion:** Never claim tests, builds, or audits passed without observed output (`assertExecutionResult` rejects `completed` without `evidence[]`).
5. **On-Demand Specialization:** Start with the 5 MVP agents; instantiate specialist definitions only when workload or risk justifies them.
