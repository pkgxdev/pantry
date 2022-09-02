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

import useSourceUnarchiver from "hooks/useSourceUnarchiver.ts"
import useCellar from "hooks/useCellar.ts"
import usePantry from "hooks/usePantry.ts"
import useCache from "hooks/useCache.ts"
import { lvl1 as link } from "prefab/link.ts"
import build from "prefab/build.ts"
import { Package, parsePackageRequirement, semver } from "types"
import useFlags from "hooks/useFlags.ts"
import usePlatform from "hooks/usePlatform.ts"
import hydrate from "prefab/hydrate.ts"

useFlags()

const pantry = usePantry()
const cellar = useCellar()

const dry = Deno.args.map(parsePackageRequirement)

const rv: Package[] = []
for (const pkgrq of dry) {
  const versions = await pantry.getVersions(pkgrq)
  const version = semver.maxSatisfying(versions, pkgrq.constraint)
  if (!version) throw "no-version-found"
  const pkg = { project: pkgrq.project, version }

  console.log({ building: pkgrq.project })

  // Get the source
  const prebuild = async () => {
    const dstdir = cellar.mkpath(pkg).join("src")
    const { url, stripComponents } = await pantry.getDistributable(pkg)
    const { download } = useCache()
    const zip = await download({ pkg, url, type: 'src' })
    await useSourceUnarchiver().unarchive({
      dstdir,
      zipfile: zip,
      stripComponents
    })
  }

  //TODO this was already calculated in `sort` and should not be recalculated
  const deps = await pantry.getDeps(pkg)
  const wet = await hydrate(deps.runtime, pkg => pantry.getDeps(pkg).then(x => x.runtime))
  deps.runtime.push(...wet.pkgs)

  const env = usePlatform().platform == 'darwin'
    ? {MACOSX_DEPLOYMENT_TARGET: ['11.0']}
    : undefined

  // Build and link
  const path = await build({ pkg, deps, prebuild, env })
  await link({ path, pkg })

  rv.push(pkg)
}

const built_pkgs = rv.map(({ project, version }) => `${project}@${version}`).join(" ")
const txt = `::set-output name=pkgs::${built_pkgs}\n`
await Deno.stdout.write(new TextEncoder().encode(txt))
