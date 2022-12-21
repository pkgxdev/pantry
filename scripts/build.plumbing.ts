#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{tea.prefix}}
  - --allow-env
  - --unstable
  - --import-map={{ srcroot }}/import-map.json
---*/

import { usePantry } from "hooks"
import { pkg as pkgutils } from "utils"
import { useFlags, usePrefix } from "hooks"
import { set_output } from "./utils/gha.ts"
import build, { BuildResult } from "./build/build.ts"
import * as ARGV from "./utils/args.ts"

useFlags()

const pantry = usePantry()
const dry = await ARGV.toArray(ARGV.pkgs())
const gha = !!Deno.env.get("GITHUB_ACTIONS")
const group_it = gha && dry.length > 1
const rv: BuildResult[] = []

for (const rq of dry) {
  const pkg = await pantry.resolve(rq)

  if (group_it) {
    console.log("::group::", pkgutils.str(pkg))
  } else {
    console.log({ building: pkg.project })
  }

  rv.push(await build(pkg))

  if (group_it) {
    console.log("::endgroup::")
  }
}

const to = usePrefix()
await set_output("pkgs", rv.map(x => pkgutils.str(x.installation.pkg)))
await set_output("paths", rv.map(x => x.installation.path), '%0A')
await set_output("relative-paths", rv.map(x => x.installation.path.relative({ to })))
await set_output("srcs", rv.map(x => x.src?.relative({ to }) ?? "~"))
await set_output("srcs-relative-paths", rv.compact(x => x.src?.relative({ to })))
