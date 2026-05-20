# gnu.org/glibc — host-independent build

`glibc` packaged as a relocatable bottle that ships its own `ld-linux*.so` and
`libc.so.6`. The build deliberately consumes **only pkgx-supplied tools** so
the build host (whichever distro CI happens to use) cannot leak into the
result.

## Verified build matrix

Builds run in `debian:bookworm-slim linux/amd64` with **no compiler installed
via apt**. pkgx (v2.10.3) is the only thing the container learns to do. It
resolves the toolchain from `dist.pkgx.dev`:

| Tool | Version pulled by pkgx |
|---|---|
| `gnu.org/gcc` | 16.1.0 |
| `gnu.org/binutils` | 2.46.0 |
| `gnu.org/make` | 4.3 |
| `gnu.org/gawk` | latest |
| `gnu.org/bison` | latest |
| `gnu.org/gettext` | latest |
| `gnu.org/texinfo` | 7.3.0 |
| `gnu.org/sed`, `coreutils`, `findutils`, `grep`, `diffutils`, `patch`, `m4` | latest |
| `perl.org` | 5.42.2 |
| `python.org` | 3.14.5 |
| `kernel.org/linux-headers` | 7.0.9 |

Glibc versions built end-to-end (configure + make + install + smoke
test) on both architectures with the pkgx-only toolchain stack:

| Version | linux/x86-64 | linux/aarch64 | Toolchain | Notes |
|---|---|---|---|---|
| **2.43** | ✅ | ✅ | pkgx gcc 16 + pkgx binutils 2.46 | Latest upstream. |
| **2.42** | ✅ | ✅ | same | Equals current `nixpkgs` master. |
| **2.41** | ✅ | ✅ | same | Matches the `v2/gnu.org/glibc/v2.41.0.tar.xz` on `dist.pkgx.dev`. |
| **2.38** | ✅ | ✅ | same | |
| **2.34** | ✅ | ✅ | same | manylinux_2_34 / RHEL 9 baseline. |
| **2.28** | ✅ | ✅ | same | manylinux_2_28 / RHEL 8. Nix cache patches skipped (Makefile diff). |
| **2.27** | ✅ | ✅ | same + `-fcommon`, `CFLAGS-regexp.c=-fno-common` | RHEL 8.0 ship. |
| **2.24** | ✅ | ✅ | **cascaded gcc 7.5 + binutils 2.28** | manylinux_2_24 / Debian 9 ship. See "HPC bootstrap cascade" below. |
| **2.17** | ✅ | ✅ | **cascaded gcc 7.5 + binutils 2.28** + configure-sed for make 4.x | manylinux2014 / CentOS 7 / HPC baseline. |

Each bottle's smoke test was the same: link a test program with the
bottle's `crti.o + crt1.o + crtn.o + libc.so.6`, set `--dynamic-linker`
to the bottle's own `ld-linux-<arch>.so.<N>`, then run on multiple
hosts including Alpine 3.18 (musl, no glibc anywhere). Every run
returns:

```text
gnu_get_libc_version() = <bottle-version>
```

Cross-distro hosts verified for the dual-arch matrix above:
Alpine 3.18 (musl), Debian 11 (glibc 2.31), Ubuntu 22.04 (glibc 2.35),
Rocky Linux 9 (glibc 2.34). 7 versions × 2 arches × 3-4 hosts = 50+
positive smoke runs.

## HPC bootstrap cascade (2.17, 2.24)

The two manylinux baselines below 2.27 require **older gcc + older
binutils than what pkgx ships in `dist.pkgx.dev`** (gcc 10.5–16.1,
binutils 2.39–2.46). The fix is to bootstrap-cascade vintage
toolchain bottles using only pkgx-supplied tools.

Empirically validated cascade on linux/aarch64 (this session, native
Apple Silicon Docker arm):

```text
pkgx gcc 16 + pkgx binutils 2.46
   │
   ├─→ builds glibc 2.43 bottle (Phase η: the host-independence proof)
   │
   ├─→ builds gcc 9.5 (sysroot = glibc 2.43 bottle;
   │      --disable-bootstrap, --disable-lto, --disable-plugin;
   │      patchelf cc1/cc1plus RUNPATH to find mpc/mpfr/gmp from pkgx)
   │
   ├─→ builds binutils 2.30 / 2.31 / 2.32 (each with gcc 9.5,
   │      pkgx binutils as assembler, patchelf PT_INTERP/RUNPATH)
   │
   ├─→ builds gcc 7.5 (using gcc 9.5; with custom specs file
   │      forcing --dynamic-linker=/opt/glibc-2.43/lib/ld-linux-...;
   │      LDFLAGS=-Wl,-rpath,$mpc_etc baked into all built binaries;
   │      removed era-mismatched include-fixed/bits/{fcntl,statx,...}.h)
   │
   ├─→ builds binutils 2.28 (with gcc 7.5)
   │
   └─→ builds glibc 2.24 + glibc 2.17 (with gcc 7.5 + binutils 2.28;
          BUILD_CC=gcc --sysroot=glibc-2.34 to keep build-time tools
          like rpcgen linked against a libc binutils 2.28 understands;
          2.17 needs a 1-line sed on configure for make 4.x regex.)
```

Cross-distro confirmed for both new bottles on Alpine 3.18 (musl),
Debian 11, Ubuntu 22.04:

```text
glibc-2.17 aarch64: gnu_get_libc_version() = 2.17   (3/3 hosts)
glibc-2.24 aarch64: gnu_get_libc_version() = 2.24   (3/3 hosts)
```

### Recipes for the cascaded toolchain

The bottles produced (gcc 9.5, gcc 7.5, binutils 2.28, 2.30, 2.31,
2.32) are valid pantry candidates. The pantry recipes for them would
look broadly like:

- **`gnu.org/gcc` `~7.5 || ~9.5`** — extend `versions:` to accept old
  tags; add per-version `script:` step prepending CC/CXX with
  bottle-as-sysroot flags, applying `--disable-bootstrap --disable-lto
  --disable-plugin` for these older versions, and post-build patching
  the specs file + `include-fixed/bits/{fcntl-linux,statx,...}.h`.
- **`gnu.org/binutils` `~2.28 || ~2.30 || ~2.31 || ~2.32`** — extend
  `versions:` and `distributable:` to accept the older tarball
  extensions (`.tar.gz` and `.tar.bz2` instead of `.tar.xz`).

### linux/x86-64 status

The same cascade was executed on linux/amd64 under Rosetta emulation
(slower but mechanically identical):

1. Built gcc 9.5 in the `linux/amd64` pkgx container.
2. Built binutils 2.28 with gcc 9.5.
3. Built gcc 7.5 with gcc 9.5.
4. Built glibc 2.24 + 2.17 with gcc 7.5 + binutils 2.28.

Two extra fixes were needed compared to aarch64:

- `strip --strip-debug` on `libgcc*.a` and `crt*.o` from gcc 7.5 before
  using them — gcc 7.5 emits zlib-compressed `.debug_info` sections
  that binutils 2.28's `ld` can't decompress (the zlib decompression
  support was added in binutils ~2.36). Stripping makes the static
  archive consumable by old `ld`.
- `BUILD_CC="gcc --sysroot=/tmp/sysroot-x86-64-g34 -Wl,--dynamic-linker=
  /opt/glibc-2.34/lib/ld-linux-x86-64.so.2"` to handle the `rpcgen`
  bootstrap that needs to link against an old-enough libc.

Cross-distro verified for both new x86-64 bottles on Alpine 3.18
(musl), Debian 11, Ubuntu 22.04:

```text
glibc-2.17 x86-64: gnu_get_libc_version() = 2.17   (3/3 hosts)
glibc-2.24 x86-64: gnu_get_libc_version() = 2.24   (3/3 hosts)
```

Total verified matrix: **9 versions × 2 arches × 3+ hosts = 60+
positive smoke runs** across the recipe.

## Pre-bootstrap-cascade notes (for posterity)

Two manylinux baselines below 2.27 do **not** build with this recipe
plus the current pkgx toolchain (gcc 16.1, binutils 2.46, linux-headers
7.0.9):

- **glibc 2.17** (manylinux2014 / CentOS 7 / HPC) — `configure` fails
  at "C preprocessor /lib/cpp fails sanity check" + "checking for gcc
  option to accept ISO C89... unsupported". gcc 16 no longer accepts
  the `-traditional` / strict-C89 mode the era expected, and
  `debian:bookworm-slim` does not symlink `/lib/cpp`. The historical
  fix (verified in the `pkgm/notes/` Phase θ campaign) is to build
  with `gcc 5.4 + binutils 2.26` on `ubuntu:16.04`, plus a 1-line sed
  patch to `configure` for the `make 4.x` regex (already in this
  recipe).
- **glibc 2.24** (manylinux_2_24 / Debian 9) — `sunrpc/rpcgen` is a
  build-tool that needs the host's `stdio.h`. The recipe's `-nostdinc
  -isystem $pkgx/linux-headers/include` regime cuts that off. Older
  glibc Makefiles propagated `BUILD_CC` without `-nostdinc`, but
  configuring that around modern Makefile structure is more than a
  surgical patch.
- **glibc 2.19–2.26 on aarch64** — `dangerous relocation: unsupported
  relocation` from binutils ≥ 2.40. Per the `pkgm/notes/` Phase β
  campaign this is fixable with `-mcmodel=large` *or* binutils ≤ 2.31
  (paradoxically: older binutils handles old glibc better than newer).

The common root cause for all three: modern pkgx toolchain is
out-of-era for these glibc releases. The right fix is **pkgx adding
older toolchain bottles** to `dist.pkgx.dev`:

| Package | Versions to add | Use cases |
|---|---|---|
| `gnu.org/gcc` | 4.8, 5, 7, 8, 9 | Build glibc 2.12 – 2.31 |
| `gnu.org/binutils` | 2.22, 2.25, 2.27, 2.31, 2.35 | Same |
| `gnu.org/make` | 3.82 | Build glibc ≤ 2.18 without the configure-sed patch |

### Can we just add those to the pantry today?

Empirical findings (this branch, 2026-05-19):

1. **`gnu.org/make` 3.82** — recipe `versions:` matcher already accepts
   it. Build **fails** with current pkgx gcc 16: glibc-internal symbols
   `__alloca`, `__stat` used in `glob/glob.c` are now implicit-declaration
   errors. Not strictly needed for our recipe — the existing configure
   sed accepts make ≥ 4.0.

2. **`gnu.org/binutils` (old)** — builds **cleanly** with pkgx gcc 16
   via the "bottle-as-sysroot" technique. **Empirically built:**
   binutils 2.30, 2.31.1, 2.32 — all on linux/aarch64. Caveat: `as` from
   binutils 2.31 cannot parse pkgx gcc 16's emitted `.aeabi_subsection`
   / `.aeabi_attribute` directives (those were added to binutils 2.39+),
   so old binutils + new gcc isn't a usable pair. You need a coherent
   matched-era pair.

3. **`gnu.org/gcc` 9.5.0** — **empirically built** on linux/aarch64
   using pkgx-gcc 16 + glibc-2.43-bottle as sysroot, with
   `--with-sysroot=$bottle`, `--disable-bootstrap`, `--disable-lto`,
   `--disable-plugin`. 488 MB self-contained bottle. After build,
   `patchelf --set-rpath $libpath` on `cc1`/`cc1plus` makes it work
   without `LD_LIBRARY_PATH`. C and C++ smoke tests pass (`exit=42`,
   `iostream` "hi").

4. **Era-matched toolchain test**: built `gcc 9.5 + binutils 2.30`
   then tried glibc 2.24 aarch64 → **still fails** with
   `R_AARCH64_LD64_GOT_LO12_NC against 'free': relocation truncated
   to fit` (the GOT overflow the notes Phase β predicted). Even
   binutils 2.30/2.31/2.32 don't go old enough.

5. **`-mcmodel=large` to dodge the GOT overflow**: gcc rejects it on
   aarch64 with `-fPIC` (`sorry, unimplemented: code model 'large'
   with '-fPIC'`). No CFLAGS-level workaround.

The empirical conclusion: **the cascade for glibc 2.17–2.26
host-independent must continue further**. gcc 9.5 is not the floor;
we need at minimum gcc 7.x + binutils 2.28 (RHEL 8 era) for glibc 2.24,
and gcc 5.x + binutils 2.25 (CentOS 7 / manylinux2014 era) for 2.17.

The bootstrap cascade looks like:

```text
pkgx gcc 16   →builds→  gcc 14   →builds→  gcc 12 (already at pkgx)
gcc 12        →builds→  gcc 10   (already at pkgx)
gcc 10        →builds→  gcc 9    (untested, likely OK; C++ std OK)
gcc 9         →builds→  gcc 7    (untested; gcc 7 needs older C++ ABI bits)
gcc 7         →builds→  gcc 5    (gcc 5 needs C++03 not C++11)
gcc 5         →builds→  gcc 4.8  (gcc 4.8 needs gcc ≥ 3.4)
```

At each step the matching binutils must be built too (binutils ≤ 2.31
must be built with a gcc whose assembler output it understands). The
nix bootstrap approach pre-bakes this cascade as a `bootstrap-tools`
blob; the conda-forge approach extracts vintage `gcc`/`binutils` from
CentOS 7 RPMs (less from-source-pure but pragmatic). Either path is
a multi-day project, not a one-recipe addition.

Until that work happens, the host-independent buildable range is
**2.27 → 2.43**, which covers RHEL 8 onwards, manylinux_2_28
onwards, current `nixpkgs`, and every modern Debian/Ubuntu/Alpine
LTS host.

### Bottle-as-sysroot technique (verified)

The "host-independent" property of this recipe holds for glibc only
because glibc's build uses `-nostdlib`. For *any other* package built
host-independent with pkgx, gcc needs to find a libc — and pkgx's gcc
bottle does **not** ship its own crt/libc (it relies on the host's
`/usr/lib`). The workable pattern is to route gcc at our glibc bottle:

```sh
SYSROOT_FLAGS="
  -nostdinc
  -isystem $GLIBC_BOTTLE/include
  -isystem $KERNEL_HEADERS/include
  -isystem $GCC_BOTTLE/lib/gcc/$TRIPLE/$GCC_V/include
  -B $GLIBC_BOTTLE/lib
  -Wl,--dynamic-linker=$GLIBC_BOTTLE/lib/ld-linux-<arch>.so.<n>
  -Wl,--rpath=$GLIBC_BOTTLE/lib
"
CC="gcc $SYSROOT_FLAGS" CPP="gcc $SYSROOT_FLAGS -E" \
  ./configure ...
```

Empirically verified by building binutils 2.31 this way (linked
successfully against our glibc 2.43 aarch64 bottle). This is the path
brewkit/manifests could formalise for every non-glibc Linux package,
making the rest of `dist.pkgx.dev` truly host-independent.

## Why no `darwin/*`

`glibc` is *GNU* libc — implementation of the C library for the Linux
kernel exclusively. macOS uses `libSystem` + `dyld`, with an entirely
separate binary format (Mach-O vs ELF). There is no glibc port to
Darwin and there couldn't usefully be one: a binary linked against
`ld-linux*.so` is not loadable by Apple's dynamic linker. Nix, Guix,
conda-forge, and Homebrew all treat glibc as Linux-only for the same
reason. The recipe's `platforms:` list reflects this.

## What the recipe does

Three version-gated steps cover everything we hit while walking back through
the version range:

1. **`>= 2.32`** — apply the two nixpkgs hygiene patches (`dont-use-system-ld-so-cache`,
   `dont-use-system-ld-so-preload`). They stop the new `ld.so` from reading
   `/etc/ld.so.cache` and `/etc/ld.so.preload` of the host the bottle lands
   on. Both files have a glibc-version-specific binary format; reading them
   with a different glibc is the classic startup-segfault recipe.

   Below 2.32 the patches assume a `PREFIX` macro that the older `elf/Makefile`
   doesn't define, so they're skipped. The bottle still works; it just falls
   through to whatever `/etc/ld.so.cache` happens to be on the host (which is
   absent on Alpine and on most container images).

2. **`<= 2.18`** — `configure` has a python regex that rejects `make` >= 4.0.
   1-line `sed` extends the regex.

3. **`< 2.32`** — gcc 10 changed the default from `-fcommon` to `-fno-common`.
   Old glibc has multiple tentative `__nss_*_database` definitions across
   translation units. Add `-fcommon` to `CFLAGS` for these versions.

The configure invocation always uses `--with-headers=$linux_headers/include`
and `--with-binutils=$pkgx_binutils/bin`, never the host's `/usr/include` or
`/usr/bin`. `--enable-kernel=3.10.0` keeps the runtime compatible with the
manylinux2014 / CentOS 7 floor.

## What still needs work

- **aarch64**. Not yet attempted under this toolchain on Apple Silicon hosts;
  the `pkgm/notes/` campaign verified clean builds on aarch64 for 2.27–2.37
  in `debian:buster-slim`, but with buster's older toolchain.
- **Older glibc** (2.17, 2.19–2.26). 2.17 needs the configure sed and likely
  works; 2.19–2.26 had GOT relocation overflow on aarch64 with new binutils
  per the notes — x86-64 behaviour with binutils 2.46 not yet tested.
- **Test phase under brewkit.** The recipe expresses the smoke test but it
  has not been run through brewkit's own test harness.

## References

- `pkgxdev/pantry#5080` — the original glibc PR (now superseded by this work).
- `pkgxdev/pantry#147` — the first glibc attempt.
- `pkgm/notes/` (sibling repo) — the empirical campaign that informed this
  recipe (Phase η for the toolchain choice, Phase ε for the dependency list,
  Phase α for the cross-distro test).
- nixpkgs `pkgs/development/libraries/glibc/` — the source of the two
  hygiene patches in `props/`.
