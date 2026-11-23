---
doc_id: PLN-ORG-002
project_id: organization
department: orchestration
doc_type: implementation-plan
owner: chief-of-staff
status: proposed
version: "1.0"
access_classification: internal
sources:
  - https://github.com/ThienNg65/ThienLabs/issues/1#section-5
  - https://github.com/ThienNg65/ThienLabs/issues/1#section-17
  - docs/plans/2026-11-23-phase-1-mvp.md
  - organization/governance/agent-governance.md
  - organization/governance/security-policy.md
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Implementation Plan: ThienLabs Phase 2–3 Runtime Architecture

## 1. Objective & Scope

Move `ThienLabs` from manual prompt-enforced Markdown governance (Phase 1) to a **lightweight, local-first CLI & runtime** that enforces [RFC #1 Sec 5 & Sec 17](https://github.com/ThienNg65/ThienLabs/issues/1) guardrails programmatically:

- **Phase 2 (Project Infrastructure & Policy Enforcement):** Deterministic project provisioning, YAML contract validation, `access_classification` isolation, and authorized context-envelope assembly.
- **Phase 3 (Agent Execution & Provider Adapters):** Provider-agnostic dispatcher, execution ledger, programmatic circuit breakers (`max_handoff_hops: 4`, `max_step_retries: 2`), and Level 3 Director approval pauses.

**Non-goals for Phase 2–3:** No web dashboard, no always-on cloud daemon, and no vector database until deterministic lexical + frontmatter retrieval proves insufficient.

---

## 2. Logical Architecture (RFC #1 Sec 5.2)

```text
Director (Chat / CLI)
  │
  ▼
Organization Control Layer (CLI + Policy Engine + Ledger)
  ├── Validator: YAML frontmatter, relative links, isolation boundaries
  ├── Context Builder: registry → project-context → permissions.read filter
  └── Circuit Breakers: hop <= 4, retries <= 2, Level 3 approval pause
  │
  ▼
Agent Execution Layer (Provider-Agnostic Dispatcher)
  ├── Adapter: Claude / Claude Code
  ├── Adapter: OpenAI / Codex
  └── Adapter: Google Gemini
  │
  ▼
Integration & Knowledge Layers
  ├── GitHub (MCP / API) & Local Repos (scoped by project-context.md)
  └── Markdown Knowledge Base + Execution Ledger (.jsonl)
```

---

## 3. Phase 2 — Project Infrastructure (`thienlabs validate` & `init-project`)

### 3.1 Deliverables
1. **Policy & Schema Validator (`validate`)**:
   - Parse YAML frontmatter on all `organization/` and `projects/` Markdown files.
   - Verify required fields per `doc_type` and [agent-governance.md](../../organization/governance/agent-governance.md) (`agent_id`, `project_id`, `access_classification`, `permissions`, `provider_policy`).
   - Verify all relative Markdown links resolve to existing files.
   - Enforce isolation rules from [security-policy.md](../../organization/governance/security-policy.md): flag any `public-marketing` / `public-release` reference to `private-engineering` paths or internal repo names.
2. **Context Envelope Builder (`build-context`)**:
   - Implements the deterministic lookup order: `project-registry.md` → `projects/<id>/project-context.md` → files matching the target agent's `permissions.read` globs and `access_classification` ceiling.
   - Strips or blocks files above the agent's `access_classification` so unauthorized context never enters the prompt.
3. **Project Provisioner (`init-project <project-id>`)**:
   - Scaffolds `projects/<project-id>/` (`project-context.md`, `project-vision.md`, `goals-and-metrics.md`, `decisions/`, `knowledge-base/`, and 4 lead stubs) from `organization/templates/` and registers the unit in [project-registry.md](../../organization/project-registry.md).

### 3.2 Phase 2 Acceptance Criteria
- `validate` replaces ad-hoc validation scripts and passes in CI on every PR.
- `build-context` deterministically refuses to load `private-engineering` files for `public` or `internal`-only agents.
- A second project unit can be scaffolded in one command without manual template copying.

---

## 4. Phase 3 — Agent Execution (`thienlabs run` & Provider Adapters)

### 4.1 Provider-Agnostic Agent Contract
Adapters implement one minimal interface translating [agent-definition.md](../../organization/templates/agent-definition.md) + [task-brief.md](../../organization/templates/task-brief.md):

```typescript
interface ExecutionRequest {
  taskId: string;
  agent: AgentContract;        // parsed from lead/specialist frontmatter
  contextFiles: ContextFile[]; // filtered by Phase 2 Context Builder
  briefMarkdown: string;
  hopCount: number;
}

interface ExecutionResult {
  status: "completed" | "handoff" | "blocked" | "needs_approval";
  evidence: string[];          // cited file paths, command outputs, or URLs
  handoffTo?: string;          // target department/agent_id
  approvalRequest?: string;    // populated when Level 3 gate triggers
}
```

### 4.2 Execution Ledger & Circuit Breakers
- **Append-only Ledger (`runtime/ledger.jsonl`):** Records `task_id`, `project_id`, `owner_agent`, `provider`, `hop_count`, `retry_count`, `status`, and `timestamp`.
- **Duplicate Check:** Before dispatching a `TaskBrief`, check active ledger entries for matching `project_id` + open target.
- **Hop & Retry Enforcement:** Reject handoffs when `hop_count >= 4` (`max_handoff_hops`) and halt after `retry_count >= 2` (`max_step_retries`), escalating to Chief of Staff / Director.
- **Level 3 Gate:** When an agent requests PR merge, release, scope change, or security-sensitive edit, transition task to `needs_approval` and emit a populated [approval-request.md](../../organization/templates/approval-request.md) for Director sign-off.

### 4.3 Phase 3 Acceptance Criteria
- A single `TaskBrief` executes end-to-end through at least two provider adapters (e.g., Gemini + Claude/Codex) with identical `ExecutionResult` and ledger trace.
- Circuit breakers (`hop_count = 4`, `retry_count = 2`) and Level 3 approval pauses are verified by automated unit tests.

---

## 5. Open Decisions for Director Sign-Off

1. **Runtime Language:** TypeScript / Node.js v22 (aligns with `ferry` ecosystem and `@google/genai` / `@anthropic-ai/sdk` / `openai` SDKs) vs. Python 3.12+. *Recommended: TypeScript / Node.js v22.*
2. **Initial Provider Adapters:** Which two providers should Phase 3 wire up first (e.g., Gemini + Anthropic/Claude Code, or Gemini + OpenAI/Codex)?
3. **First Live Test Target:** Validate Phase 2 `init-project` on a real second project (e.g., `VietExplore` or `Protagonist`) or on a synthetic test fixture first?
