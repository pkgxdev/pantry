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
  - --import-map={{ srcroot }}/import-map.json
---*/

import { usePantry } from "hooks"
import build from "./build/build.ts"
import { Package } from "types"
import { pkg as pkgutils } from "utils"
import { useFlags, usePrefix } from "hooks"

useFlags()

const pantry = usePantry()
const dry = Deno.args.map(pkgutils.parse)
const gha = !!Deno.env.get("GITHUB_ACTIONS")
const group_it = gha && dry.length > 1
const rv: Package[] = []

if (usePrefix().string != "/opt") {
  console.error({ TEA_PREFIX: usePrefix().string })
  throw new Error("builds must be performed in /opt (try TEA_PREFIX=/opt)")
}

for (const rq of dry) {
  const pkg = await pantry.resolve(rq)

  if (group_it) {
    console.log("::group::", pkgutils.str(pkg))
  } else {
    console.log({ building: pkg.project })
  }

  await build(pkg)
  rv.push(pkg)

  if (group_it) {
    console.log("::endgroup::")
  }
}

const built_pkgs = rv.map(({ project, version }) => `${project}@${version}`).join(" ")
const txt = `::set-output name=pkgs::${built_pkgs}\n`
await Deno.stdout.write(new TextEncoder().encode(txt))
