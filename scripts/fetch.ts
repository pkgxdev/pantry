#!/usr/bin/env -S tea -E

/*---
dependencies:
  gnu.org/tar: 1
  tukaani.org/xz: 5
  sourceware.org/bzip2: 1
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{ tea.prefix }}
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

//TODO verify the sha

import { usePantry, useCache, useDownload, useCellar, useSourceUnarchiver, useOffLicense, useFlags} from "hooks"
import { print } from "utils"
import { Stowage, Package } from "types"
import * as ARGV from "./utils/args.ts"
import Path from "path"

useFlags()

const pantry = usePantry()
const { download } = useDownload()

export async function fetch_src(pkg: Package): Promise<[Path, Path] | undefined> {
  const dstdir = useCellar().shelf(pkg.project).join("src", `v${pkg.version}`)
  const dist = await pantry.getDistributable(pkg)
  if (!dist) return
  const { url, stripComponents } = dist
  const stowage: Stowage = { pkg, type: 'src', extname: url.path().extname() }
  const dst = useCache().path(stowage)
  const zipfile = await (async () => {
    try {
      // first try our mirror
      const src = useOffLicense('s3').url(stowage)
      return await download({ dst, src })
    } catch {
      // oh well, try original location then
      return await download({ dst, src: url })
    }
  })()
  await useSourceUnarchiver().unarchive({ dstdir, zipfile, stripComponents })
  return [dstdir, zipfile]
}

if (import.meta.main) {
  for await (let pkg of ARGV.pkgs()) {
    pkg = await pantry.resolve(pkg)
    const rv = await fetch_src(pkg)
    if (rv) {
      // a package doesn’t require a source tarball
      //FIXME is this dumb tho? In theory a package could just be a build script that generates itself
      // in practice this is rare and pkgs could just specify some dummy tarball
      await print(rv.join("\n") + "\n")
    }
  }
}
