# TamaGo — bare-metal Go toolchain

A minimally-patched Go distribution ([usbarmory/tamago-go]) that adds
**`GOOS=tamago`** — execution on **bare metal, with no operating system** — on
top of upstream Go. Together with the [tamago framework] it lets you write
**pure-Go, cgo-free** firmware/unikernels that run directly on hardware or in
VMs.

Supported targets include **amd64** (Cloud Hypervisor, Firecracker, QEMU
microvm, UEFI, GCE), **arm** / **arm64** (NXP i.MX, Raspberry Pi, …), and
**riscv64**. It tracks upstream Go releases (`tamago-go1.26.3` ≈ Go 1.26.3).

## Usage

This package ships `bin/go` like [go.dev], so it deliberately declares **no
`provides:`** — it must not hijack the bare `go`/`gofmt` commands. Use it
explicitly with `+`:

```sh
# the framework provides the runtime overlay + board packages
export GOOSPKG=github.com/usbarmory/tamago

# build a bare-metal Go program (example: QEMU sifive_u, riscv64)
pkgx +github.com/usbarmory/tamago-go -- \
  env GOOS=tamago GOARCH=riscv64 go build -ldflags "-T 0x80010000 -R 0x1000" main.go
```

Your application imports a board package so hardware init happens on import:

```go
import _ "github.com/usbarmory/tamago/board/qemu/sifive_u"
```

See the [tamago framework] for boards, SoC drivers, and per-target link
addresses, and [go-boot] for a UEFI boot manager built on TamaGo.

### The `tamago` CLI (alternative)

Upstream also ships a `tamago` command (`go install
github.com/usbarmory/tamago/cmd/tamago@latest`) that downloads and runs the
matching `tamago-go` for an application's `go.mod`. This package gives you the
toolchain directly instead, so nothing is fetched at run time.

## License

The Go distribution is BSD-3-Clause (The Go Authors); the TamaGo patches are by
The TamaGo Authors.

[usbarmory/tamago-go]: https://github.com/usbarmory/tamago-go
[tamago framework]: https://github.com/usbarmory/tamago
[go-boot]: https://github.com/usbarmory/go-boot
[go.dev]: https://pkgx.dev/pkgs/go.dev/
