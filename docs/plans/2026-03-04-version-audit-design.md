# PKGX Pantry Version Audit — Design Document

**Date:** 2026-03-04
**Target audit date:** 2026-03-06
**Branch:** `audit/version-updates-2026-03-06`

## Goal

Identify high-impact infrastructure packages in the pkgxdev/pantry that are behind their latest upstream versions, and submit a PR updating the top 5 most impactful.

## Approach

Hybrid: Clone locally + explore `bk audit` tooling + custom scripted version comparison.

## Audit Scope

~40-50 high-impact infrastructure packages across these categories:

| Category | Packages |
|----------|----------|
| Runtimes | Node.js, Python, Go, Ruby, Rust, Java/OpenJDK, Deno, Bun |
| Build tools | CMake, Meson, Ninja, Make, Autoconf |
| Core libraries | OpenSSL, zlib, libffi, SQLite, ICU |
| Developer tools | Git, curl, wget, jq, ripgrep, fd, fzf |
| Databases | PostgreSQL, Redis, MySQL/MariaDB |
| Containers/Infra | Docker CLI, Terraform, Kubernetes tools |

## Process

1. Parse `versions` field from each `package.yml`
2. Query upstream GitHub tags/releases for latest version
3. Compare and identify version gaps
4. Select top 5 most impactful stale packages
5. Update their `package.yml` files
6. Submit PR (no merge)

## Deliverables

1. Full audit report table (all ~40-50 packages)
2. Updated `package.yml` files for top 5
3. Pull request on pkgxdev/pantry
