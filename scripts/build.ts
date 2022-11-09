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

import { usePantry, useFlags, useCellar, useInventory } from "hooks"
import { hydrate, install, link } from "prefab"
import { str as pkgstr } from "utils/pkg.ts"
import * as ARGV from "./utils/args.ts"
import { panic } from "utils/error.ts"
import build from "./build/build.ts"

useFlags()

const pantry = usePantry()
const cellar = useCellar()
const inventory = useInventory()
const dry = await ARGV.toArray(ARGV.pkgs())
const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})

for (const pkg of wet.wet) {
  if (!await cellar.has(pkg)) {
    const version = await inventory.select(pkg) ?? panic(`${pkgstr(pkg)} not found`)
    const installation = await install({ project: pkg.project, version })
    await link(installation)
  }
}

for (const rq of dry) {
  const pkg = await pantry.resolve(rq)
  await build(pkg)
  await link(pkg)
}
