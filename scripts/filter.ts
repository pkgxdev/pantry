#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { useCellar, useFlags } from "hooks"
import * as ARGV from "./utils/args.ts"

useFlags()

/// filters out everything that is already installed

const cellar = useCellar()
const desired_filter = !!Deno.env.get("INVERT")

const rv: string[] = []
for await (const pkg of ARGV.pkgs()) {
  const isInstalled = !!await cellar.has(pkg)
  if (isInstalled == desired_filter) {
    rv.push(pkg.project)
  }
}

if (Deno.env.get("GITHUB_ACTIONS")) {
  console.log(`::set-output name=pkgs::${rv.join(" ")}\n`)
} else {
  console.log(rv.join("\n"))
}
