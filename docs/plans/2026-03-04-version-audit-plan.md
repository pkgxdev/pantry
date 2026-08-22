# PKGX Pantry Version Audit — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Audit high-impact infrastructure packages in pkgxdev/pantry for version staleness, and submit a PR updating the top 5 most impactful packages.

**Architecture:** Clone pantry locally, parse package.yml files for version constraints and blockers, compare with upstream latest releases, then update the 5 most actionable packages on a feature branch and submit a PR.

**Tech Stack:** Shell scripting, GitHub API (gh CLI), YAML editing, git

---

## Audit Findings Summary

### Packages with EXPLICIT Version Blocks

| Package | Current Cap | Upstream Latest | Root Cause |
|---------|------------|-----------------|------------|
| **curl.se** | ≤8.17.x | 8.18.0 | `openssl.org: ^1.1` — curl 8.18+ needs OpenSSL 3 |
| **nodejs.org** | Builds with OpenSSL 1.1 | v25.8.0 | `openssl.org: 1.1` hard pin — Node 22+ LTS needs OpenSSL 3 |
| **jq** | Tracks `stedolan/jq` (archived) | 1.8.1 (via jqlang/jq) | Wrong upstream repo reference |
| **cmake.org** | curl build dep capped `<8.13` | 4.2.3 | curl enum API change in 8.13 |

### Packages with Stale Build Dependency Pins

| Package | Stale Pin | Current Upstream |
|---------|-----------|-----------------|
| **terraform.io** | `go.dev: ~1.24.1` | Go 1.26.0 |
| **kubernetes.io/kubectl** | `go.dev: ~1.24.4` | Go 1.26.0 |
| **rust-lang.org** | `python.org: '>=3<3.12'` | Python 3.14.3 |
| **python.org** | `zlib.net: =1.3.1` | zlib 1.3.2 |
| **python.org** | `tcl-lang.org: =8.6.16` | (pinned due to build issue) |

---

## Top 5 Updates for PR

Selected for **impact × feasibility** (avoiding the cross-cutting OpenSSL 1→3 migration):

1. **jq** — Migrate upstream from `stedolan/jq` → `jqlang/jq` + update distributable URL
2. **terraform.io** — Update Go build dep from `~1.24.1`
3. **kubernetes.io/kubectl** — Update Go build dep from `~1.24.4`
4. **python.org** — Update zlib pin from `=1.3.1` to `=1.3.2`
5. **rust-lang.org** — Relax Python build dep from `<3.12` to `<3.15`

---

### Task 1: Generate Full Audit Report

**Files:**
- Create: `docs/audit/2026-03-06-version-audit-report.md`

**Step 1: Create audit report with all findings**

Write a comprehensive Markdown table documenting all ~40 audited packages with:
- Package name and domain
- Version source type (GitHub tags/releases, FTP scrape)
- Latest upstream version
- Any version blocks/constraints
- Status (current / blocked / stale dep)

**Step 2: Commit the audit report**

```bash
git add docs/audit/2026-03-06-version-audit-report.md
git commit -m "docs: add version audit report for high-impact packages"
```

---

### Task 2: Update jq — Migrate to jqlang/jq

**Files:**
- Modify: `projects/stedolan.github.io/jq/package.yml`

**Step 1: Read current package.yml**

Read `projects/stedolan.github.io/jq/package.yml` to get the exact current state.

**Step 2: Update the version source and distributable URL**

Changes needed:
- `versions.github`: `stedolan/jq/releases` → `jqlang/jq/releases`
- `distributable.url`: Update from `https://github.com/stedolan/jq/releases/download/...` to `https://github.com/jqlang/jq/releases/download/jq-{{version.raw}}/jq-{{version.raw}}.tar.gz`
- Verify the strip pattern `/jq /` still works with jqlang releases

**Step 3: Verify the jqlang/jq release asset URLs are correct**

```bash
gh api repos/jqlang/jq/releases/latest --jq '.assets[].name'
```

Confirm the tarball naming convention matches.

**Step 4: Commit**

```bash
git add projects/stedolan.github.io/jq/package.yml
git commit -m "fix(jq): migrate upstream from stedolan/jq to jqlang/jq

stedolan/jq is archived. The active maintained fork is jqlang/jq.
Updates version source and distributable URL to track the canonical repo."
```

---

### Task 3: Update terraform.io — Go Build Dependency

**Files:**
- Modify: `projects/terraform.io/package.yml`

**Step 1: Read current package.yml**

Read `projects/terraform.io/package.yml`.

**Step 2: Check Terraform's go.mod for required Go version**

```bash
gh api repos/hashicorp/terraform/contents/go.mod --jq '.content' | base64 -d | head -5
```

This tells us the minimum Go version Terraform requires. Update the `go.dev` build dep to match (use tilde pin on whatever the go.mod specifies).

**Step 3: Update the Go build dependency pin**

Change `go.dev: ~1.24.1` to match the go.mod requirement from Terraform's latest release.

**Step 4: Commit**

```bash
git add projects/terraform.io/package.yml
git commit -m "fix(terraform): update Go build dependency pin

Update go.dev build dependency to match Terraform's current go.mod requirement."
```

---

### Task 4: Update kubernetes.io/kubectl — Go Build Dependency

**Files:**
- Modify: `projects/kubernetes.io/kubectl/package.yml`

**Step 1: Read current package.yml**

Read `projects/kubernetes.io/kubectl/package.yml`.

**Step 2: Check Kubernetes go.mod for required Go version**

```bash
gh api repos/kubernetes/kubernetes/contents/go.mod --jq '.content' | base64 -d | head -5
```

**Step 3: Update the Go build dependency pin**

Change `go.dev: ~1.24.4` to match the go.mod requirement.

**Step 4: Commit**

```bash
git add projects/kubernetes.io/kubectl/package.yml
git commit -m "fix(kubectl): update Go build dependency pin

Update go.dev build dependency to match Kubernetes's current go.mod requirement."
```

---

### Task 5: Update python.org — zlib Dependency Pin

**Files:**
- Modify: `projects/python.org/package.yml`

**Step 1: Read current package.yml**

Read `projects/python.org/package.yml`.

**Step 2: Verify zlib 1.3.2 compatibility with Python**

Check Python's configure script or docs to confirm zlib 1.3.2 is supported. The exact pin `=1.3.1` exists because it matches tcl-lang.org's zlib requirement — verify tcl also works with 1.3.2.

**Step 3: Update zlib pin**

Change `zlib.net: =1.3.1` to `=1.3.2` (if tcl is compatible) or to `^1.3` (more flexible).

**Step 4: Commit**

```bash
git add projects/python.org/package.yml
git commit -m "fix(python): update zlib dependency pin to 1.3.2

zlib 1.3.2 is the current stable release. Update exact version pin."
```

---

### Task 6: Update rust-lang.org — Python Build Dependency

**Files:**
- Modify: `projects/rust-lang.org/package.yml`

**Step 1: Read current package.yml**

Read `projects/rust-lang.org/package.yml`.

**Step 2: Verify Rust's Python requirements**

Check Rust's build docs or `configure` script to confirm which Python versions are supported for building.

```bash
gh api repos/rust-lang/rust/contents/configure --jq '.content' | base64 -d | grep -i python | head -10
```

**Step 3: Relax Python build dependency**

Change `python.org: '>=3<3.12'` to a wider range (e.g., `'>=3<3.15'`) if confirmed compatible.

**Step 4: Commit**

```bash
git add projects/rust-lang.org/package.yml
git commit -m "fix(rust): relax Python build dependency range

Allow newer Python versions (3.12+) for Rust builds. Previous <3.12 cap
was overly restrictive."
```

---

### Task 7: Create Pull Request

**Step 1: Push branch to remote**

```bash
git push -u origin audit/version-updates-2026-03-06
```

**Step 2: Create PR**

```bash
gh pr create --repo pkgxdev/pantry \
  --title "audit: update 5 high-impact package dependencies" \
  --body "$(cat <<'EOF'
## Summary

Version audit of ~40 high-impact infrastructure packages as of 2026-03-06.

### Changes
- **jq**: Migrate upstream from archived `stedolan/jq` to active `jqlang/jq`
- **terraform**: Update Go build dependency pin to match go.mod
- **kubectl**: Update Go build dependency pin to match go.mod
- **python**: Update zlib dependency pin to 1.3.2
- **rust**: Relax Python build dependency range

### Audit Report
Full audit report included at `docs/audit/2026-03-06-version-audit-report.md`

### Notable Findings (not addressed in this PR)
- **curl**: Blocked at ≤8.17.x due to OpenSSL 1.1 dependency (8.18+ requires OpenSSL 3)
- **Node.js**: Hard-pinned to OpenSSL 1.1 — cross-cutting OpenSSL 3 migration needed
- **OpenSSL 1→3 migration**: Multiple packages (curl, Node, Python, Ruby) depend on OpenSSL 1.1. A coordinated migration plan is recommended.

## Test plan
- [ ] Verify jq version discovery works with jqlang/jq releases
- [ ] Verify Terraform builds with updated Go version
- [ ] Verify kubectl builds with updated Go version
- [ ] Verify Python builds with zlib 1.3.2
- [ ] Verify Rust builds with Python 3.12+

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**Step 3: Return PR URL to user**
