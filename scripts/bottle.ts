#!/usr/bin/env -S tea -E

/* ---
dependencies:
  gnu.org/tar: ^1.34
  tukaani.org/xz: ^5
  zlib.net: 1
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-env
  - --allow-read
  - --allow-write
  - --import-map={{ srcroot }}/import-map.json
--- */

import { Installation } from "types"
import { useCellar, usePrefix, useFlags, useCache } from "hooks"
import { run, pkg as pkgutils } from "utils"
import { crypto } from "deno/crypto/mod.ts"
import { encode } from "deno/encoding/hex.ts"
import Path from "path"

const cellar = useCellar()


//-------------------------------------------------------------------------- main

if (import.meta.main) {
  useFlags()

  const compression = Deno.env.get("COMPRESSION") == 'xz' ? 'xz' : 'gz'

  const bottles: Path[] = []
  const checksums: Path[] = []
  const artifacts: Path[] = []
  for (const pkg of Deno.args.map(pkgutils.parse)) {
    console.log({ bottling: { pkg } })

    const installation = await cellar.resolve(pkg)
    const path = await bottle(installation, compression)
    const checksum = await sha256(path)

    console.log({ bottled: { path } })

    bottles.push(path)
    checksums.push(checksum)
  }

  if (bottles.length === 0) throw new Error("no input provided")

  const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()

  const bottles_out = bottles.map(x => x.string).join(' ')
  await Deno.stdout.write(encode(`::set-output name=bottles::${bottles_out}\n`))

  const checksums_out = checksums.map(x => x.string).join(' ')
  await Deno.stdout.write(encode(`::set-output name=checksums::${checksums_out}\n`))

  // newline separated for the upload-artifact action
  artifacts.push(...bottles, ...checksums)
  await Deno.stdout.write(encode(`::set-output name=artifacts::${artifacts.join('%0A')}\n`))
}


//------------------------------------------------------------------------- funcs
export async function bottle({ path: kegdir, pkg }: Installation, compression: 'gz' | 'xz'): Promise<Path> {
  const tarball = useCache().path({ pkg, type: 'bottle', compression })
  const z = compression == 'gz' ? 'z' : 'J'
  const cwd = usePrefix()
  const cmd = ["tar", `c${z}f`, tarball, kegdir.relative({ to: cwd })]
  await run({ cmd, cwd })
  return tarball
}

async function sha256(file: Path): Promise<Path> {
  const sha = await Deno.open(file.string, { read: true })
    .then(file => crypto.subtle.digest("SHA-256", file.readable))
    .then(buf => new TextDecoder().decode(encode(new Uint8Array(buf))))
  const text = `${sha}  ${file.basename()}`
  return new Path(`${file}.sha256sum`).write({ text, force: true })
}
