#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { Package, PackageRequirement } from "types"
import { usePantry, useFlags } from "hooks"
import { hydrate } from "prefab"
import * as ARGV from "./utils/args.ts"
import { set_output } from "./utils/gha.ts"
import { pkg } from "utils"

const pantry = usePantry()

useFlags()

const mode: 'build' | 'install' = 'build' //Deno.args.includes("-b") ? 'build' : 'install'

const get_deps = async (pkg: Package | PackageRequirement) => {
  const deps = await pantry.getDeps(pkg)
  switch (mode) {
  case 'build':
    return [...deps.build, ...deps.runtime]
  // case 'install':
  //   return deps.runtime
  }
}

const rv: PackageRequirement[] = []
for await (const pkg of ARGV.pkgs()) {
  const deps = await get_deps(pkg)
  const wet = await hydrate(deps)
  rv.push(...wet.pkgs)
}

const gas = rv.map(pkg.str)

if (Deno.env.get("GITHUB_ACTIONS")) {
  set_output("pkgs", gas)
} else {
  console.log(gas.join("\n"))
}
