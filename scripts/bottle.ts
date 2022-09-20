#!/usr/bin/env -S tea -E

/* ---
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
import { useCellar, useCache, usePrefix, useFlags } from "hooks"
import { run, parse_pkg_requirement } from "utils"
import { crypto } from "deno/crypto/mod.ts"
import { encode } from "deno/encoding/hex.ts"
import Path from "path"

const cellar = useCellar()
const filesListName = 'files.txt'


//-------------------------------------------------------------------------- main

if (import.meta.main) {
  useFlags()

  const bottles: Path[] = []
  const checksums: Path[] = []
  const artifacts: Path[] = []
  for (const pkg of Deno.args.map(parse_pkg_requirement)) {
    console.log({ bottling: { pkg } })

    const installation = await cellar.resolve(pkg)
    const path = await bottle(installation)
    const checksum = await sha256(path)
    artifacts.push(installation.path.join(filesListName))

    if (!path) throw new Error("wtf: bottle already exists")
    if (!checksum) throw new Error("failed to compute checksum")

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
export async function bottle({ path: kegdir, pkg }: Installation): Promise<Path> {

  const files = await walk(kegdir, path => {
    /// HACK: `go` requires including the `src` dir
    const isGo = kegdir.string.match(/\/go.dev\//)
    switch (path.relative({ to: kegdir })) {
    case 'src':
      return isGo ? 'accumulate' : 'skip'
    case 'build.sh':
    case filesListName:
      return 'skip'
    default:
      return 'accumulate'
    }
  })
  const relativePaths = files.map(x => x.relative({ to: usePrefix() }))
  const filelist = kegdir
    .join(filesListName)
    .write({
      text: relativePaths.join("\n"),
      force: true
    })
  const tarball = useCache().bottle(pkg)

  await run({
    cmd: [
      "tar", "zcf", tarball, "--files-from", filelist
    ],
    cwd: usePrefix()
  })

  return tarball
}

// using our own because of: https://github.com/denoland/deno_std/issues/1359
// but frankly this also is more suitable for our needs here
type Continuation = 'accumulate' | 'skip'

export async function walk(root: Path, body: (entry: Path) => Continuation): Promise<Path[]> {
  const rv: Path[] = []
  const stack: Path[] = [root]

  do {
    root = stack.pop()!
    for await (const [path, entry] of root.ls()) {
      switch (body(path)) {
      case 'accumulate':
        if (entry.isDirectory) {
          stack.push(path)
        } else {
          rv.push(path)
        }
        break
      case 'skip':
        continue
      }
    }
  } while (stack.length > 0)

  return rv
}

async function sha256(file: Path): Promise<Path> {
  const sha = await Deno.open(file.string, { read: true })
    .then(file => crypto.subtle.digest("SHA-256", file.readable))
    .then(buf => new TextDecoder().decode(encode(new Uint8Array(buf))))
  const text = `${sha}  ${file.basename()}`
  return new Path(`${file}.sha256sum`).write({ text })
}
