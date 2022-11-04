#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
env:
  TEA_PANTRY_PATH: "{{srcroot}}"
---*/

import { PackageRequirement } from "types"
import { usePantry, useFlags } from "hooks"
import { hydrate } from "prefab"
import { pkg } from "utils"

const pantry = usePantry()

useFlags()

const mode: 'build' | 'install' = Deno.args.includes("-b") ? 'build' : 'install'
const get_deps = async (pkg: PackageRequirement) => {
  const deps = await pantry.getDeps(pkg)
  switch (mode) {
  case 'build':
    return [...deps.build, ...deps.runtime]
  case 'install':
    return deps.runtime
  }
}

const dry = Deno.args.compact(arg => !arg.startsWith('-') && pkg.parse(arg))
const explicit = new Set(dry.map(x=>x.project))
const wet = await hydrate(dry, get_deps)
const gas = wet.pkgs.compact(({project}) => {
  if (Deno.args.includes('-i')) {
    return project
  } else if (!explicit.has(project)){
    return project
  }
})

if (Deno.env.get("GITHUB_ACTIONS")) {
  console.log(`::set-output name=pkgs::${gas.join(" ")}\n`)
} else {
  console.log(gas.join("\n"))
}
