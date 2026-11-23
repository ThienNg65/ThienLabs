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

Every agent definition must declare YAML frontmatter with:

- `agent_id`: Unique identifier (e.g., `ferry-eng-lead`)
- `name`: Human-readable role name
- `project_id`: `organization` or registered `<project-id>`
- `department`: `orchestration` | `marketing` | `product` | `development` | `education`
- `role`: Specific role title
- `reports_to`: Reporting line (e.g., `chief-of-staff` or `director`)
- `status`: `active` | `paused` | `deprecated`
- `access_classification`: Highest classification the agent may read (`public` | `internal` | `private-engineering` | `restricted`)
- `tools`: Allowed tool categories
- `permissions`: Explicit `read`, `write`, `execute`, and `external_action` boundaries
- `provider_policy`: Preferred task routing profile (provider-agnostic)

## Planning & Execution Guardrails

1. **One Accountable Owner:** Every task has exactly one accountable owner at any point in time.
2. **Complexity-First Routing:** Do not spin up multi-agent orchestration for `Simple` requests (direct lookups, explanations, or single-file checks).
3. **Circuit Breakers:**
   - `max_handoff_hops: 4` per task chain. If a task is unresolved at hop 4, escalate to Chief of Staff / Director instead of bouncing further.
   - `max_step_retries: 2` on transient tool/execution failures. Classify failure cause (provider, tool, permission, context, ambiguity) before retrying.
   - **Stop-and-replan:** If a core assumption in a Task Brief fails or contradicts observed code/evidence, stop execution and update the plan rather than improvising silently.
4. **Evidence-Only Completion:** Agents must never claim tests, builds, or audits passed unless they ran them and observed the output. Missing or unverified data must be marked `[UNVERIFIED]` or `[NEEDS DIRECTOR INPUT]`.
5. **On-Demand Specialization:** Start with the 5 MVP agents (`chief-of-staff` + 4 department leads). Instantiate specialist roles only when workload or risk justifies them.
