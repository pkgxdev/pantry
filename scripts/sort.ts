#!/usr/bin/env -S tea -E

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

// sorts input for building
// does a full hydration, but only returns ordered, dry packages


import { parsePackageRequirement } from "types"
import hydrate from "prefab/hydrate.ts"
import useFlags from "hooks/useFlags.ts"
import usePantry from "../src/hooks/usePantry.ts"

const flags = useFlags()
const pantry = usePantry()

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})
const gas = wet.dry.map(x => x.project)

if (Deno.env.get("GITHUB_ACTIONS")) {
  const pre = wet.wet.map(x=>x.project)
  console.log(`::set-output name=pkgs::${gas.join(" ")}`)
  console.log(`::set-output name=pre-install::${pre.join(" ")}`)
} else if (flags.json) {
  console.log(gas)
} else {
  console.log(gas.join("\n"))
}
