---
doc_id: PRJ-FERRY-CTX-001
project_id: ferry
department: orchestration
doc_type: project-context
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Ferry Project Context

## Authorized Repositories & Classification Boundaries

| Repo | Local Path | Remote | Classification | Purpose |
|---|---|---|---|---|
| `ferry` | `C:\toys\ferry-dev\ferry` | `https://github.com/ThienNg65/ferry.git` | `private-engineering` | Source code (Neutralinojs WebView2 + Node.js v22 sidecar + Vue 3/Pinia), tests, ADRs, CI/CD |
| `ferry-release` | `C:\toys\ferry-dev\ferry-release` | `https://github.com/ThienNg65/ferry-release.git` | `public-release` | Public installers (`Ferry-Setup-*.exe`, `Ferry-Portable-*-win-x64.zip`), release assets, public issue/changelog target |
| `ferry-website` | `C:\toys\ferry-dev\ferry-website` | `https://github.com/ThienNg65/ferry-website.git` | `public-marketing` | Nuxt commercial website (`https://www.ferryssh.com`), `PRODUCT.md`, `DESIGN.md`, `/vs/*` comparisons |

## Isolation & Security Boundaries

- **Private vs. Public separation:** `ThienNg65/ferry` is private. Public website links, marketing copy, and public issue/changelog references must point to `ThienNg65/ferry-release`, never leak private source internals.
- **No secrets in docs:** Ferry uses Windows DPAPI (`src/main/host/dpapiKey.ts`) so secrets never cross IPC decrypted. Agents must never store credentials or SSH keys in Markdown or prompts.
- **Protocol scope:** SSH and SFTP only (no FTP, FTPS, SCP, S3, RDP, VNC, or X11).
- **Platform:** Windows 10/11 (64-bit).

## Deterministic Search Map (Authoritative vs. Historical)

1. **Product & Brand Truth:** `C:\toys\ferry-dev\ferry-website\PRODUCT.md` and `DESIGN.md`.
2. **Engineering Truth:** `C:\toys\ferry-dev\ferry\CLAUDE.md` → `.claude/PROJECT_MAP.md` → `docs/adr/` → `docs/ci-cd-release-workflow.md`.
3. **Historical Only (Not Current Truth):** `ferry/.claude/architecture/` and `ferry/.claude/plan/` explain past design intent, not guaranteed current behavior.
4. **Distribution Channels:** Microsoft Store (`9PJPWK568P53`, signed MSIX) and GitHub Releases (`ThienNg65/ferry-release`).
