#!/usr/bin/env -S tea -E

/* ---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-env
  - --allow-read=/opt/
  - --allow-write=/opt/
  - --import-map={{ srcroot }}/import-map.json
--- */

import { Installation, parsePackageRequirement } from "types"
import { Path } from "types"
import useCellar from "hooks/useCellar.ts"
import { run } from "utils"
import useCache from "hooks/useCache.ts"
import useFlags from "hooks/useFlags.ts"

useFlags()

const cellar = useCellar()
const filesListName = 'files.txt'

const rv: Path[] = []
for (const pkg of Deno.args.map(parsePackageRequirement)) {
  console.log({ bottling: { pkg } })

  const installation = await cellar.resolve(pkg)
  const path = await bottle(installation)

  if (!path) throw new Error("wtf: bottle already exists")

  console.log({ bottled: { path } })

  rv.push(path)
  rv.push(installation.path.join(filesListName))
}

if (rv.length === 0) throw new Error("no input provided")

const paths = rv.map(x => x.string).join('%0A')
const txt = `::set-output name=filenames::${paths}\n`
await Deno.stdout.write(new TextEncoder().encode(txt))


//------------------------------------------------------------------------- funcs
async function bottle({ path: kegdir, pkg }: Installation): Promise<Path> {

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
