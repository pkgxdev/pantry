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

// sorts input for building
// does a full hydration, but only returns ordered, dry packages


import { pkg } from "utils"
import { usePantry, useFlags } from "hooks"
import { hydrate } from "prefab"
import { PackageRequirement } from "types"
import * as ARGV from "./utils/args.ts"

const flags = useFlags()
const pantry = usePantry()

const dry = await ARGV.toArray(ARGV.pkgs())

const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})

if (Deno.env.get("GITHUB_ACTIONS")) {
  const massage = (input: PackageRequirement[]) =>
    input.map(p => {
      let out = pkg.str(p)
      // shell quoting via GHA is weird and we don’t fully understand it
      if (/[<>]/.test(out)) out = `"${out}"`
      return out
    }).join(" ")

  console.log(`::set-output name=pkgs::${massage(wet.dry)}`)
  console.log(`::set-output name=pre-install::${massage(wet.wet)}`)
} else {
  const gas = wet.dry.map(x => pkg.str(x))
  if (flags.json) {
    console.log(gas)
  } else {
    console.log(gas.join("\n"))
  }
}
