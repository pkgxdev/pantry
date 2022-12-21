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

import { usePantry, useFlags, useCellar, useInventory, usePrefix } from "hooks"
import { hydrate, install, link } from "prefab"
import { str as pkgstr } from "utils/pkg.ts"
import * as ARGV from "./utils/args.ts"
import { panic } from "utils/error.ts"
import build, { BuildResult } from "./build/build.ts"
import { set_output } from "./utils/gha.ts"
import { pkg as pkgutils } from "utils"

useFlags()

const pantry = usePantry()
const cellar = useCellar()
const inventory = useInventory()
const raw = await ARGV.toArray(ARGV.pkgs())
const rv: BuildResult[] = []

for (const rq of raw) {
  const dry = await pantry.getDeps(rq)
  const wet = await hydrate([...dry.runtime, ...dry.build])

  for (const pkg of wet.pkgs) {
    if (!await cellar.has(pkg)) {
      const version = await inventory.select(pkg) ?? panic(`${pkgstr(pkg)} not found`)
      const installation = await install({ project: pkg.project, version })
      await link(installation)
    }
  }

  const pkg = await pantry.resolve(rq)
  rv.push(await build(pkg))
  await link(pkg)
}

if (Deno.env.get("GITHUB_ACTIONS")) {
  const to = usePrefix()
  await set_output("pkgs", rv.map(x => pkgutils.str(x.installation.pkg)))
  await set_output("paths", rv.map(x => x.installation.path), '%0A')
  await set_output("relative-paths", rv.map(x => x.installation.path.relative({ to })))
  await set_output("srcs", rv.map(x => x.src?.relative({ to }) ?? "~"))
  await set_output("srcs-relative-paths", rv.compact(x => x.src?.relative({ to })))
}
