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

useFlags()

const pantry = usePantry()
const cellar = useCellar()

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const rv: Package[] = []
for (const pkgrq of dry) {
  const versions = await pantry.getVersions(pkgrq)
  const version = semver.maxSatisfying(versions, pkgrq.constraint)
  if (!version) throw "no-version-found"
  const pkg = { project: pkgrq.project, version }

  if (Deno.env.get("SKIP") && await cellar.isInstalled(pkg)) {
    console.log({ skipping: pkg.project })
    continue
  }

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

  const deps = await pantry.getDeps(pkg)

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
