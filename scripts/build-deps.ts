#!/usr/bin/env -S tea -E

/// deps to build the provided including building all its deps too

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read=/opt,/Library/Developer/CommandLineTools
  - --allow-write=/opt
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { parsePackageRequirement } from "types"
import hydrate from "prefab/hydrate-topological.ts"
import useFlags from "hooks/useFlags.ts"
import { PackageRequirement } from "types"
import usePantry from "hooks/usePantry.ts"

const flags = useFlags()
const pantry = usePantry()

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const wet = await hydrate(dry, get)
const gas = wet.map(x => x.project)

if (Deno.env.get("GITHUB_ACTIONS")) {
  console.log(`::set-output name=pkgs::${gas.join(" ")}`)
} else if (flags.json) {
  console.log(gas)
} else {
  console.log(gas.join("\n"))
}


async function get(pkg: PackageRequirement) {
  const { build, runtime } = await pantry.getDeps(pkg)
  return [...build, ...runtime]
}