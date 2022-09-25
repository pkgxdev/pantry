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

// sorts input for building
// does a full hydration, but only returns ordered, dry packages


import { pkg } from "utils"
import { usePantry, useFlags } from "hooks"
import { hydrate } from "prefab"

const flags = useFlags()
const pantry = usePantry()

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(pkg.parse)

const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})
const gas = wet.dry.map(x => x.project)

if (Deno.env.get("GITHUB_ACTIONS")) {
  const pre = wet.wet.map(x => `"${pkg.str(x)}"`)
  console.log(`::set-output name=pkgs::${gas.join(" ")}`)
  console.log(`::set-output name=pre-install::${pre.join(" ")}`)
} else if (flags.json) {
  console.log(gas)
} else {
  console.log(gas.join("\n"))
}
