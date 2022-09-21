#!/usr/bin/env -S tea -E

/*---
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

import { usePantry, useCache, useCellar, useSourceUnarchiver } from "hooks"
import { Command } from "cliffy/command/mod.ts"
import { print, pkg as pkgutils } from "utils"

const { args } = await new Command()
  .name("tea-fetch-src")
  .arguments("<pkgspec:string>")
  .parse(Deno.args)

const pantry = usePantry()
const req = pkgutils.parse(args[0])
const pkg = await pantry.resolve(req);   console.debug(pkg)

const dstdir = useCellar().keg(pkg).join("src")
const { url, stripComponents } = await pantry.getDistributable(pkg)
const { download } = useCache()
const zipfile = await download({ pkg, url, type: 'src' })
await useSourceUnarchiver().unarchive({ dstdir, zipfile, stripComponents })

await print(`${dstdir}\n`)
