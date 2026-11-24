---
doc_id: TASK-FERRY-005
project_id: ferry
department: product
doc_type: task-brief
owner: ferry-prd-lead
created_by: ferry-prd-lead
parent_task_id: null
status: draft
priority: high
hop_count: 0
max_hops: 4
approval_stage: level-3
workflow_phase: intake
version: "1.0"
access_classification: internal
sources:
  - https://github.com/ThienNg65/ferry-release/issues/3
  - https://github.com/ThienNg65/ferry-release/releases/tag/ferry-v1.4.0
supersedes: null
created_at: "2026-11-24"
updated_at: "2026-11-24"
target_date: "2026-11-26"
---

# Task Brief: Enable Immutable Releases for Public Ferry Distribution Artifacts

## Objective & Background
Protect Ferry's public Windows installer (`Ferry-Setup-*.exe`), portable ZIP (`Ferry-Portable-*-win-x64.zip`), and auto-update manifest (`latest.yml`) on `ThienNg65/ferry-release` against post-publication modification or tag tampering, as raised in [ThienNg65/ferry-release#3](https://github.com/ThienNg65/ferry-release/issues/3). With `ferry-v1.4.0` published on `2026-11-24T11:24:51Z`, locking future public releases at the GitHub repository boundary closes a high-priority supply-chain integrity gap.

## Scope
- **Included:**
  - Product requirements and acceptance criteria for enabling GitHub Release immutability on `ThienNg65/ferry-release`.
  - Draft-then-publish verification lifecycle and fail-closed recovery expectations for existing immutable releases (referencing public distribution artifacts in `ThienNg65/ferry-release` only).
- **Excluded:**
  - Modifying `ThienNg65/ferry-release` repository settings, `ferry-website`, or private engineering internals without Level 3 Director approval.
  - Exposing private engineering source code or repository internals in public or product documentation.

## Requirements & Constraints
- **Classification boundary:** Keep all public references pointed to `ThienNg65/ferry-release` or `https://www.ferryssh.com`.
- **Fail-closed integrity:** Never overwrite (`--clobber`) assets on an already-published immutable release; verify assets and SHA-256 digests before publishing a draft release.
- **Compatibility:** Preserve public release versioning, changelog updates on `ThienNg65/ferry-release`, and auto-update (`latest.yml`) resolution.
- **Dependencies:** Level 3 Director approval required before enabling repository-level release immutability in `ThienNg65/ferry-release` settings and modifying release automation.

## Expected Deliverables & Acceptance Criteria
- [ ] **Given** a new Ferry release is prepared for `ThienNg65/ferry-release`, **When** repository-level release immutability is enabled and all expected assets (`Ferry-Setup-*.exe`, `Ferry-Portable-*-win-x64.zip`, `latest.yml`) pass verification before publishing the draft release, **Then** GitHub reports `immutable: true` for the published release and blocks post-publication asset replacement or tag movement.
- [ ] **Given** an immutable release already exists for a target tag in `ThienNg65/ferry-release`, **When** release publication is re-run for that tag, **Then** the workflow verifies existing assets and digests without attempting `--clobber` and fails closed if any asset or digest mismatches.
- [ ] **Given** `ferry-v1.4.0` or newer public releases are live, **When** users download installers via `https://www.ferryssh.com` or `ThienNg65/ferry-release`, **Then** release discovery, changelog publication, and `latest.yml` auto-updates continue operating without regression.

## Required Evidence
- GitHub release API metadata for the first post-enablement release showing `immutable: true` and release attestation.
- Verification run logs confirming draft upload, asset/digest validation, and non-destructive rerun behavior.
- Documented operational note on the one-way nature of immutable releases in [goals-and-metrics.md](../goals-and-metrics.md) or release runbook.

## Workflow Phase & Visibility
- **Current phase:** `intake`
- **GitHub body metadata:** `Workflow phase: intake`
- Mirror the current phase with the GitHub label `phase:intake`. For Ferry PRs, preserve Conventional Commit titles and do not add phase prefixes.

## Approval Gate
- **Required level:** Level 3 (Director Approval) — required before changing `ThienNg65/ferry-release` repository settings, merging release-workflow changes, or publishing the first immutable release.
