#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

// sorts input for building
// does a full hydration, but only returns ordered, dry packages


import { pkg } from "utils"
import { usePantry, useFlags } from "hooks"
import { hydrate } from "prefab"
import * as ARGV from "./utils/args.ts"
import { set_output } from "./utils/gha.ts";

const flags = useFlags()
const pantry = usePantry()

const dry = await ARGV.toArray(ARGV.pkgs())

const wet = await hydrate(dry, async (pkg, dry) => {
  const deps = await pantry.getDeps(pkg)
  return dry ? [...deps.build, ...deps.runtime] : deps.runtime
})

if (Deno.env.get("GITHUB_ACTIONS")) {
  await set_output('pkgs', wet.dry.map(pkg.str))
} else {
  const gas = wet.dry.map(pkg.str)
  if (flags.json) {
    console.log(gas)
  } else {
    console.log(gas.join("\n"))
  }
}
