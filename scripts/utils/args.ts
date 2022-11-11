import { Installation, Package, PackageRequirement } from "types"
import { useCellar } from "hooks"
import { parse } from "utils/pkg.ts"

/// processes Deno.args unless STDIN is not a TTY and has input
export async function *args(): AsyncGenerator<string> {
  if (Deno.isatty(Deno.stdin.rid)) {
    for (const arg of Deno.args) {
      if (arg[0] != '-') yield arg
    }
  } else {
    let yielded_something = false
    const buf = new Uint8Array(10)
    const decode = (() => { const d = new TextDecoder(); return d.decode.bind(d) })()
    let n: number | null
    let txt = ''
    const rx = /\s*(.*?)\s+/
    while ((n = await Deno.stdin.read(buf)) !== null) {
      txt += decode(buf.subarray(0, n))
      while (true) {
        const match = txt.match(rx)
        if (!match) break
        yield match[1]
        txt = txt.slice(match[0].length)
        yielded_something = true
      }
    }
    if (txt) {
      yield txt
    } else if (!yielded_something) {
      for (const arg of Deno.args) {
        yield arg
      }
    }
  }
}

export async function *pkgs(): AsyncGenerator<Package | PackageRequirement> {
  for await (const arg of args()) {
    const match = arg.match(/projects\/(.*)\/package.yml/)
    const project = match ? match[1] : arg
    yield parse(project)
  }
}

export async function *installs(): AsyncGenerator<Installation> {
  const cellar = useCellar()
  for await (const pkg of pkgs()) {
    yield await cellar.resolve(pkg)
  }
}

export async function toArray<T>(input: AsyncGenerator<T>) {
  const rv: T[] = []
  for await (const i of input) {
    rv.push(i)
  }
  return rv
}
