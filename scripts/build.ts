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
import install from "prefab/install.ts"
import build from "prefab/build.ts"
import { semver, PackageRequirement, Package } from "types"
import { parsePackageRequirement } from "types"
import hydrate from "prefab/hydrate.ts"
import resolve from "prefab/resolve.ts"
import { get_build_deps } from "./_lib.ts"
import useFlags from "hooks/useFlags.ts"
import usePlatform from "hooks/usePlatform.ts"

useFlags()

const pantry = usePantry()
const cellar = useCellar()

const dry = Deno.args.map(project => {
  const match = project.match(/projects\/(.*)\/package.yml/)
  return match ? match[1] : project
}).map(parsePackageRequirement)

const explicit_deps = new Set(dry.map(({ project }) => project))

const wet = await hydrate(dry, get_build_deps(explicit_deps))
const gas = async () => {
  const rv: PackageRequirement[] = []
  for (const pkg of wet) {
    if (await cellar.isInstalled(pkg)) continue
    if (explicit_deps.has(pkg.project)) continue
    rv.push(pkg)
  }
  return rv
}
const plasma = await resolve(await gas())

for await (const pkg of plasma) {
  console.log({ installing: pkg.project })
  const installation = install(pkg)
  await link(installation)
}

const rv: Package[] = []
for await (const pkg of dry) {
  console.log({ building: pkg.project })

  const versions = await pantry.getVersions(pkg)
  const version = semver.maxSatisfying(versions, pkg.constraint)
  if (!version) throw "no-version-found"
  await b({ project: pkg.project, version })

  rv.push({ project: pkg.project, version })
}

const built_pkgs = rv.map(({ project, version }) => `${project}@${version}`).join(" ")
const txt = `::set-output name=pkgs::${built_pkgs}\n`
await Deno.stdout.write(new TextEncoder().encode(txt))

//end



async function b(pkg: Package) {

  // Get the source
  const prebuild = async () => {
    const dstdir = useCellar().mkpath(pkg).join("src")
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
}
