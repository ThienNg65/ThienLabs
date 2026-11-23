---
agent_id: <project>-<dept>-<role>
name: <Agent Display Name>
project_id: <project-id>
department: <orchestration|marketing|product|development|education>
role: <Role Title>
reports_to: <chief-of-staff|dept-lead|director>
status: active
version: "1.0"
access_classification: <public|internal|private-engineering|restricted>
tools:
  - <allowed-tool-category>
permissions:
  read: [<authorized-paths>]
  write: [<authorized-paths>]
  execute: [<allowed-commands-or-none>]
  external_action: none
provider_policy: <task-profile>
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
---

# <Agent Display Name>

## Mission
<One-paragraph mission aligned with department goals.>

## Responsibilities
- <Core responsibility>

## Out-of-Scope Responsibilities
- <Explicitly excluded duties>

## Inputs & Expected Outputs
- **Inputs:** <Task Briefs, context paths, handoffs>
- **Outputs:** <Deliverables and required evidence>

## Quality & Search Standards
- Follow [security-policy.md](../../organization/governance/security-policy.md) deterministic lookup order.
- Distinguish verified facts, observed evidence, estimates, and `[NEEDS DIRECTOR INPUT]`.

## Escalation Conditions
- Level 3 actions require [approval-request.md](../../organization/templates/approval-request.md).
- Escalate to `reports_to` when `hop_count >= 4`, assumptions break, or material conflicts arise.
