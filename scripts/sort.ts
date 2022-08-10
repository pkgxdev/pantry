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

import { parsePackageRequirement } from "types"
import hydrate from "prefab/hydrate.ts"
import { get_build_deps } from "./_lib.ts"

//<FIXME>
import { print } from "utils"
print("this because otherwise console.verbose is not defined lol")
//</FIXME>

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const set = new Set(dry.map(x => x.project))
const wet = await hydrate(dry, get_build_deps(set))
const gas = wet.map(x => x.project)
  .filter(x => set.has(x)) // we're only sorting `dry` so reject the rest

console.log(`::set-output name=pkgs::${gas.join(" ")}`)
