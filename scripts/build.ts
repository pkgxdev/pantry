#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{tea.prefix}}
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import usePantry from "hooks/usePantry.ts"
import build from "./build/build.ts"
import { Package, parsePackageRequirement, semver } from "types"
import useFlags from "hooks/useFlags.ts"
import useCellar from "hooks/useCellar.ts"

useFlags()

const pantry = usePantry()
const cellar = useCellar()
const dry = Deno.args.map(parsePackageRequirement)
const gha = !!Deno.env.get("GITHUB_ACTIONS")
const group_it = gha && dry.length > 1
const rv: Package[] = []

if (cellar.prefix.string != "/opt") {
  console.error({ TEA_PREFIX: cellar.prefix.string })
  throw new Error("builds must be performed in /opt (try TEA_PREFIX=/opt)")
}

for (const pkgrq of dry) {
  const versions = await pantry.getVersions(pkgrq)
  const version = semver.maxSatisfying(versions, pkgrq.constraint)
  if (!version) throw new Error(`no-version-found: ${pkgrq.project}`)
  const pkg = { project: pkgrq.project, version }

  if (group_it) {
    console.log("::group::", `${pkg.project}@${pkg.version}`)
  } else {
    console.log({ building: pkgrq.project })
  }

  await build(pkg)
  rv.push(pkg)

  if (group_it) {
    console.log("::endgroup::")
  }
}

const built_pkgs = rv.map(({ project, version }) => `${project}@${version}`).join(" ")
const txt = `::set-output name=pkgs::${built_pkgs}\n`
await Deno.stdout.write(new TextEncoder().encode(txt))
