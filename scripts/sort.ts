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
import { PackageRequirement } from "types"

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

if (Deno.env.get("GITHUB_ACTIONS")) {
  const massage = (input: PackageRequirement[], with_raw = false) =>
    input.map(p => {
      if (with_raw && p.constraint.raw) {
        return `${p.project}@${p.constraint.raw}`
      }
      let out = pkg.str(p)
      if (/[<>]/.test(out)) out = `"${out}"`
      return out
    }).join(" ")

  console.log(`::set-output name=pkgs::${massage(wet.dry, true)}`)
  console.log(`::set-output name=pre-install::${massage(wet.wet)}`)
} else {
  const gas = wet.dry.map(x => pkg.str(x))
  if (flags.json) {
    console.log(gas)
  } else {
    console.log(gas.join("\n"))
  }
}
