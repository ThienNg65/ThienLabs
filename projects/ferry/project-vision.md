---
doc_id: PRJ-FERRY-VIS-001
project_id: ferry
department: orchestration
doc_type: project-charter
owner: chief-of-staff
status: active
version: "1.0"
access_classification: internal
sources:
  - C:/toys/ferry-dev/ferry/README.md
  - C:/toys/ferry-dev/ferry-website/PRODUCT.md
supersedes: null
created_at: "2026-11-23"
updated_at: "2026-11-23"
---

# Project Vision: Ferry

## 1. Vision & Problem Statement
- **Problem:** Windows developers, sysadmins, and DevOps engineers managing Linux servers, VPS instances, and homelabs over SSH/SFTP often juggle separate tools for file transfers, terminal sessions, log tailing, and server monitoring.
- **Target users:** Developers, sysadmins, and DevOps engineers on Windows 10 and 11 (64-bit), including WinSCP, PuTTY, MobaXterm, FileZilla, and Termius users.
- **Product description:** **Ferry** (`https://www.ferryssh.com`) is a lightweight Windows desktop SSH/SFTP client putting a dual-pane file browser, recursive transfer queue, folder sync/compare, in-app remote file editor, interactive SSH terminal, live `tail -F` logs, and server CPU/memory/process monitor in one window—with Windows DPAPI credential encryption, zero cloud accounts, and zero telemetry.

## 2. Positioning Commitments
- **One window instead of four:** Files, SSH terminal, live `tail -F` logs, and server health share one SSH connection.
- **Fast migration:** Import saved hosts, ports, and usernames from WinSCP, PuTTY, and `~/.ssh/config` (passwords are never imported).
- **Honest comparisons:** Marketing `/vs/*` pages explicitly note when a competitor remains a better fit.

## 3. Scope
- **Included:** SSH/SFTP desktop client (`ferry`), public distribution (`ferry-release`, Microsoft Store `9PJPWK568P53`), and product website (`ferry-website`).
- **Excluded (Non-Goals):** FTP, FTPS, SCP, S3, RDP, VNC, X11, cloud accounts, or telemetry.

## 4. Director Authorization
- **Decision:** Approved — Ferry is authorized as the Phase 1 pilot unit (`C:\toys\ferry-dev` provided as reference workspace)
- **Date:** 2026-11-23
