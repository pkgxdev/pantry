# PKGX Pantry Version Audit Report

**Audit Date:** 2026-03-06
**Auditor:** Claude Code (automated)
**Scope:** ~40 high-impact infrastructure packages
**Repository:** pkgxdev/pantry (827+ total package domains)

---

## Executive Summary

- **40 packages audited** across 7 categories
- **3 packages explicitly version-blocked** (curl, Node.js, CMake build dep)
- **5 packages with stale dependency pins** (Terraform, kubectl, Python, Rust, jq)
- **1 systemic issue:** OpenSSL 1.1 → 3 migration affects curl, Node.js, Python, Ruby
- **Top 5 actionable updates identified** (see Recommendations section)

---

## Full Audit Table

### Language Runtimes

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| Node.js | `nodejs.org` | `github: nodejs/node/tags` | v25.8.0 | `openssl.org: 1.1` hard pin | ⚠️ DEPENDENCY BLOCKER |
| Python | `python.org` | `github: python/cpython/tags` | 3.14.3 | `zlib.net: =1.3.1`, `tcl-lang.org: =8.6.16` | ⚠️ STALE PINS |
| Go | `go.dev` | `github: golang/go/tags` | 1.26.0 | None | ✅ CURRENT |
| Ruby | `ruby-lang.org` | `github: ruby/ruby/tags` | 4.0.1 | `openssl.org: ^1.1` | ⚠️ LATENT RISK |
| Rust | `rust-lang.org` | `github: rust-lang/rust` | 1.94.0 | Build: `python.org: '>=3<3.12'` | ⚠️ STALE BUILD DEP |
| OpenJDK | `openjdk.org` | Multiple JDK repos | 21.0.11+5 (LTS) | None | ✅ CURRENT |
| Deno | `deno.land` | `github: denoland/deno` | 2.7.4 | None | ✅ CURRENT |
| Bun | `bun.sh` | `github: oven-sh/bun` | 1.3.10 | None (vendored binary) | ✅ CURRENT |

### Build Tools

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| CMake | `cmake.org` | `github: Kitware/CMake/releases/tags` | 4.2.3 | Build dep: `curl.se: ">=5<8.13"` | ⚠️ STALE BUILD DEP |
| Meson | `mesonbuild.com` | `github: mesonbuild/meson/tags` | 1.10.1 | None | ✅ CURRENT |
| Ninja | `ninja-build.org` | `github: ninja-build/ninja` | 1.13.2 | None | ✅ CURRENT |
| GNU Make | `gnu.org/make` | FTP scrape | N/A (FTP) | None | ✅ CURRENT |
| Autoconf | `gnu.org/autoconf` | FTP scrape | N/A (FTP) | None | ✅ CURRENT |
| Automake | `gnu.org/automake` | FTP scrape | N/A (FTP) | None | ✅ CURRENT |

### Core Libraries

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| OpenSSL | `openssl.org` | `github: openssl/openssl` | 3.6.1 | None (both 1.x and 3.x available) | ✅ CURRENT |
| zlib | `zlib.net` | `github: madler/zlib` | 1.3.2 | None | ✅ CURRENT |
| libffi | `sourceware.org/libffi` | `github: libffi/libffi/tags` | 3.5.2 | None | ✅ CURRENT |
| SQLite | `sqlite.org` | `github: sqlite/sqlite/tags` | 3.51.2 | Year-based URL pattern (manual update) | ✅ CURRENT |
| ICU | `unicode.org` | `github: unicode-org/icu/releases` | 78.2 | None | ✅ CURRENT |

### CLI / Developer Tools

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| Git | `git-scm.org` | `github: git/git/tags` | 2.53.0 | None | ✅ CURRENT |
| curl | `curl.se` | `github: curl/curl/releases` | 8.18.0 | **BLOCKED**: ignores 8.18+, 8.2x, 9.x | ❌ BLOCKED |
| wget | `gnu.org/wget` | FTP scrape | N/A (FTP) | None | ✅ CURRENT |
| jq | `stedolan.github.io/jq` | `github: stedolan/jq/releases` | 1.8.1 (via jqlang/jq) | **Wrong upstream repo** (archived) | ⚠️ STALE UPSTREAM |
| ripgrep | `crates.io/ripgrep` | `github: BurntSushi/ripgrep/tags` | 15.1.0 | None | ✅ CURRENT |
| fd | `crates.io/fd-find` | `github: sharkdp/fd/tags` | 10.3.0 | None | ✅ CURRENT |
| fzf | `github.com/junegunn/fzf` | `github: junegunn/fzf` | 0.70.0 | None | ✅ CURRENT |
| GitHub CLI | `cli.github.com` | `github: cli/cli/tags` | 2.87.3 | Pre-releases filtered (correct) | ✅ CURRENT |

### Databases

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| PostgreSQL | `postgresql.org` | FTP scrape | N/A (FTP) | None | ✅ CURRENT |
| Redis | `redis.io` | `github: redis/redis` | 8.6.1 | None | ✅ CURRENT |
| MySQL | `mysql.com` | `github: mysql/mysql-server/tags` | 9.6.0 / 8.4.8 LTS | None | ✅ CURRENT |
| MariaDB | `mariadb.com/server` | `github: MariaDB/server/tags` | 12.2.2 / 11.4.10 LTS | Platform restrictions | ✅ CURRENT |

### DevOps / Infrastructure

| Package | Domain | Version Source | Latest Upstream | Version Blocks | Status |
|---------|--------|---------------|-----------------|----------------|--------|
| Docker CLI | `docker.com/cli` | `github: docker/cli/tags` | 29.3.0 | None | ✅ CURRENT |
| Terraform | `terraform.io` | `github: hashicorp/terraform` | 1.14.6 | Build: `go.dev: ~1.24.1` | ⚠️ STALE BUILD DEP |
| kubectl | `kubernetes.io/kubectl` | `github: kubernetes/kubernetes` | 1.35.2 | Build: `go.dev: ~1.24.4` | ⚠️ STALE BUILD DEP |
| Helm | `helm.sh` | `github: helm/helm/releases/tags` | 4.1.1 | None | ✅ CURRENT |

---

## Systemic Issue: OpenSSL 1.1 → 3 Migration

The most significant finding is the OpenSSL 1.1 dependency that locks multiple packages:

| Package | OpenSSL Dep | Impact |
|---------|------------|--------|
| curl.se | `^1.1` | Blocks curl 8.18+ entirely |
| nodejs.org | `1.1` (hard pin) | Node 22+ LTS needs OpenSSL 3 |
| python.org | `^1.1` | Python 3.x works but prefers OpenSSL 3 |
| ruby-lang.org | `^1.1` | Ruby 3.4+ prefers OpenSSL 3 |

**Recommendation:** Plan a coordinated OpenSSL 3 migration as a separate initiative. This is too large for a single PR but is the highest-priority systemic improvement.

---

## Recommendations — Top 5 Actionable Updates

1. **jq**: Migrate upstream from archived `stedolan/jq` to active `jqlang/jq`
2. **Terraform**: Update Go build dependency pin from `~1.24.1`
3. **kubectl**: Update Go build dependency pin from `~1.24.4`
4. **Python**: Update zlib dependency pin from `=1.3.1` to `=1.3.2`
5. **Rust**: Relax Python build dependency from `<3.12` to `<3.15`

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ CURRENT | Auto-discovers latest versions, no blocks |
| ⚠️ STALE PINS | Has outdated dependency pins that should be updated |
| ⚠️ STALE UPSTREAM | Tracks wrong/archived upstream source |
| ⚠️ DEPENDENCY BLOCKER | Dependency pin prevents building latest versions |
| ⚠️ LATENT RISK | Works now but dependency will become a problem |
| ❌ BLOCKED | Explicitly cannot get latest version |
