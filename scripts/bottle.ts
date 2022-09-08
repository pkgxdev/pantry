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

import { Installation, parsePackageRequirement } from "types"
import { Path } from "types"
import useCellar from "hooks/useCellar.ts"
import { run } from "utils"
import useCache from "hooks/useCache.ts"
import useFlags from "hooks/useFlags.ts"
import { crypto } from "deno/crypto/mod.ts"
import { encodeToString } from "encodeToString"

const cellar = useCellar()
const filesListName = 'files.txt'


//-------------------------------------------------------------------------- main

if (import.meta.main) {
  useFlags()

  const bottles: Path[] = []
  const fileLists: Path[] = []
  for (const pkg of Deno.args.map(parsePackageRequirement)) {
    console.log({ bottling: { pkg } })

    const installation = await cellar.resolve(pkg)
    const path = await bottle(installation)
    const checksum = await sha256(path)

    if (!path) throw new Error("wtf: bottle already exists")
    if (!checksum) throw new Error("failed to compute checksum")

    console.log({ bottled: { path } })

    bottles.push(path)
    bottles.push(checksum)
    fileLists.push(installation.path.join(filesListName))
  }

  if (bottles.length === 0) throw new Error("no input provided")

  const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()

  const bottleList = bottles.map(x => x.string).join(" ")
  await Deno.stdout.write(encode(`::set-output name=bottles::${bottleList}\n`))

  const paths = [...bottles, ...fileLists].map(x => x.string).join('%0A')
  await Deno.stdout.write(encode(`::set-output name=filenames::${paths}\n`))
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
  const relativePaths = files.map(x => x.relative({ to: cellar.prefix }))
  const filelist = kegdir
    .join(filesListName)
    .write({
      text: relativePaths.join("\n")
    })
  const tarball = useCache().bottle(pkg)

  await run({
    cmd: [
      "tar", "zcf", tarball, "--files-from", filelist
    ],
    cwd: cellar.prefix
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
  const file_contents = await Deno.readFile(file.string)
  const checksum = encodeToString(new Uint8Array(await crypto.subtle.digest("SHA-256", file_contents)))
  const checksum_contents = new TextEncoder().encode(`${checksum}  ${file.basename()}`)
  const checksum_file = new Path(`${file.string}.sha256sum`)
  await Deno.writeFile(checksum_file.string, checksum_contents)

  return checksum_file
}
