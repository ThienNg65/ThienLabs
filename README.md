# ThienLabs

Project-based, semi-autonomous, multi-provider AI organization operating model ([RFC #1](https://github.com/ThienNg65/ThienLabs/issues/1)).

**Phase:** Phase 1 — Markdown & GitHub-First Foundation + 5-Agent MVP (`ferry` pilot)

## Structure

```text
organization/
  chief-of-staff.md            # Central orchestrator & complexity router
  project-registry.md          # Authorized project units & isolation boundaries
  governance/                  # Director, approval, agent, communication, and search/security policies
  templates/                   # Typed YAML-frontmatter templates for tasks, handoffs, audits, approvals
projects/
  ferry/                       # First pilot project unit (ferry, ferry-release, ferry-website)
    project-context.md         # Repo map, classification boundaries, authoritative search order
    project-vision.md
    goals-and-metrics.md
    decisions/
    knowledge-base/
    marketing/lead.md          # Ferry Marketing Lead
    product/lead.md            # Ferry Product Lead
    development/lead.md        # Ferry Engineering Lead
    education/lead.md          # Ferry Education Lead
```

## Quickstart

1. Start with [organization/chief-of-staff.md](organization/chief-of-staff.md) as the primary conversational orchestrator.
2. All project lookups follow [organization/governance/security-policy.md](organization/governance/security-policy.md) (registry → project context → authoritative map → scoped search).
3. Level 3 actions (PR merges, releases, scope shifts, security changes, spending) require explicit Director sign-off via [organization/templates/approval-request.md](organization/templates/approval-request.md).
4. Review [docs/approval-automation.md](docs/approval-automation.md) for phase labels, approval commands, event routing, and runner setup.
