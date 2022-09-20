#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { parse_pkg_requirement } from "utils"
import { useCellar, useFlags } from "hooks"

useFlags()

/// filters out everything that is already installed

const cellar = useCellar()
const desired_filter = !!Deno.env.get("INVERT")

const rv: string[] = []
for (const pkg of Deno.args.map(parse_pkg_requirement)) {
  const isInstalled = !!await cellar.isInstalled(pkg)
  if (isInstalled == desired_filter) {
    rv.push(pkg.project)
  }
}

if (Deno.env.get("GITHUB_ACTIONS")) {
  console.log(`::set-output name=pkgs::${rv.join(" ")}\n`)
} else {
  console.log(rv.join("\n"))
}
