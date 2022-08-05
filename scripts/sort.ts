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
import usePantry from "hooks/usePantry.ts"
import hydrate from "prefab/hydrate.ts"

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const cum: string[] = []
const set = new Set(dry.map(x => x.project))

const pantry = usePantry()

for (const pkg of dry) {
  const deps = await pantry.getDeps(pkg)
  const wet = await hydrate([...deps.runtime, ...deps.build])
  for (const {project: dep} of wet) {
    if (set.has(dep)) {
      cum.push(dep)
    }
  }
  cum.push(pkg.project)
}

const rv = new Array<string>()
const newset = new Set()
for (const pkg of cum) {
  if (!newset.has(pkg)) {
    rv.push(pkg)
    newset.add(pkg)
  }
}

console.log(`::set-output name=pkgs::${rv.join(" ")}`)
