#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { PackageRequirement, parsePackageRequirement } from "types"
import usePantry from "hooks/usePantry.ts"
import useFlags from "hooks/useFlags.ts"
import hydrate from "prefab/hydrate.ts"

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

const dry = Deno.args.compactMap(arg => !arg.startsWith('-') && parsePackageRequirement(arg))
const explicit = new Set(dry.map(x=>x.project))
const wet = await hydrate(dry, get_deps)
const gas = wet.pkgs.compactMap(({project}) => {
  if (Deno.args.includes('-i')) {
    return project
  } else {
    return explicit.has(project) || project
  }
})

if (Deno.env.get("GITHUB_ACTIONS")) {
  console.log(`::set-output name=pkgs::${gas.join(" ")}\n`)
} else {
  console.log(gas.join("\n"))
}
