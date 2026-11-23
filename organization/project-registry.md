---
doc_id: ORG-REG-001
project_id: organization
department: orchestration
doc_type: project-registry
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Organization Project Registry

Canonical index of authorized project units. Agents must verify project membership and repository classification here before reading or delegating project work.

| `project_id` | Name | Status | Context Path | Authorized External Repositories |
|---|---|---|---|---|
| `ferry` | Ferry | `active-pilot` | [project-context.md](../projects/ferry/project-context.md) | `C:\toys\ferry-dev\ferry` (`private-engineering`), `C:\toys\ferry-dev\ferry-release` (`public-release`), `C:\toys\ferry-dev\ferry-website` (`public-marketing`) |

## Rules

- Only projects listed as `active` or `active-pilot` may receive delegated tasks.
- Cross-project data access is denied by default unless explicitly authorized by the Director.
- New projects require a Charter ([project-charter.md](templates/project-charter.md)) and Director authorization before activation.
