# Go — `dev.simd` SIMD toolchain

A build of the Go toolchain from upstream Go's experimental **`dev.simd`** branch
(targeting Go 1.27), which adds the **`simd/archsimd`** package: portable SIMD
*intrinsics* you write in plain Go — no cgo, no hand-written assembly. The
compiler lowers them to real vector instructions on:

- **amd64** — AVX2 / AVX-512
- **arm64** — NEON

## Why this package

`simd/archsimd` is not in a released Go yet. amd64 support shipped in Go 1.26
behind `GOEXPERIMENT=simd`; **arm64 (NEON) only exists on the `dev.simd` branch**
and is slated for Go 1.27. This package lets you **build and benchmark SIMD Go
code today**, on both amd64 and Apple-Silicon/arm64, before 1.27 is released —
reproducibly, from a pinned commit.

It is a **pinned snapshot of a moving dev branch**, so it is intentionally
experimental and version-pinned (see *Versioning*). For released Go, use
[`go.dev`](https://pkgx.dev/pkgs/go.dev/).

## Usage

This package deliberately does **not** claim the `go` / `gofmt` commands (so it
never shadows the canonical `go.dev`). Use it explicitly with `+`:

```sh
# which toolchain is it?
pkgx +go.dev/dev-simd -- go version          # go version go1.27 ...

# build / run SIMD code (set the experiment flag)
GOEXPERIMENT=simd pkgx +go.dev/dev-simd -- go build ./...
GOEXPERIMENT=simd pkgx +go.dev/dev-simd -- go test ./...
```

A minimal program that uses the intrinsics:

```go
package main

import (
	"fmt"

	"simd/archsimd"
)

func main() {
	// 4-wide u32 vector add (NEON on arm64, SSE/AVX on amd64)
	a := archsimd.LoadUint32x4([]uint32{1, 2, 3, 4})
	b := archsimd.LoadUint32x4([]uint32{10, 20, 30, 40})
	var out [4]uint32
	a.Add(b).Store(out[:])
	fmt.Println(out) // [11 22 33 44]
}
```

```sh
GOEXPERIMENT=simd pkgx +go.dev/dev-simd -- go run .
```

The `simd/archsimd` package only compiles under `GOEXPERIMENT=simd`; without the
flag your code uses its normal (scalar) path.

## Versioning

`dev.simd` has no release tags, so each version is a **pinned commit**, named by
that commit's date in CalVer `YYYY.M.D.HH.MM.SS`:

```sh
pkgx +go.dev/dev-simd@2026.6.1.17.4.35 -- go version   # a specific snapshot
```

Newer commits get higher (later-dated) versions, so the latest snapshot is the
default. The exact upstream commit for each version is recorded in the recipe.

## Caveats

- **Experimental.** `simd/archsimd` is outside the Go 1 compatibility promise;
  its API can change. This is a dev-branch snapshot, not a Go release.
- **`GOEXPERIMENT=simd` is required** to compile code that imports
  `simd/archsimd`.
- For production, prefer released [`go.dev`](https://pkgx.dev/pkgs/go.dev/) —
  amd64 SIMD lands in Go 1.26, arm64 SIMD in Go 1.27.
