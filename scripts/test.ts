#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { PackageRequirement } from "types"
import { usePantry, useCellar, useFlags } from "hooks"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, pkg as pkgutils } from "utils"
import { resolve, install, hydrate, link } from "prefab"
import Path from "path"
import * as semver from "semver"

const { debug } = useFlags()
const cellar = useCellar()
const pantry = usePantry()

const pkg = await (async () => {
  const project = Deno.args[0]
  const match = project.match(/projects\/(.+)\/package.yml/)
  const parsable = match ? match[1] : project
  const pkg = pkgutils.parse(parsable)
  const installed = await cellar.resolve(pkg)
  return installed.pkg
})()

const self = {
  project: pkg.project,
  constraint: new semver.Range(pkg.version.toString())
}
const [yml] = await pantry.getYAML(pkg)
const deps = (await hydrate(self, async (pkg, dry) => {
  const { runtime, test } = await pantry.getDeps(pkg)
  return dry ? [...runtime, ...test] : runtime
})).pkgs

await install_if_needed(deps)

const env = await useShellEnv([self, ...deps])

let text = undent`
  #!/bin/bash

  set -e
  set -o pipefail
  set -x

  ${expand(env.vars)}

  `

const tmp = Path.mktmp({ prefix: `${pkg.project}-${pkg.version}+` })

try {
  if (yml.test.fixture) {
    const fixture = tmp.join("fixture.tea").write({ text: yml.test.fixture.toString() })
    text += `export FIXTURE="${fixture}"\n\n`
  }

  const cwd = tmp.join("wd").mkdir()

  text += `cd "${cwd}"\n\n`

  text += await pantry.getScript(pkg, 'test')
  text += "\n"

  for await (const [path, {name, isFile}] of pantry.prefix(pkg).ls()) {
    if (isFile && name != 'package.yml') path.cp({ into: cwd })
  }

  const cmd = tmp
    .join("test.sh")
    .write({ text, force: true })
    .chmod(0o500)
  await run({ cmd, cwd })
} finally {
  if (!debug) tmp.rm({ recursive: true })
}

//TODO install step should do this for test requirements also
async function install_if_needed(deps: PackageRequirement[]) {
  const needed: PackageRequirement[] = []
  for await (const rq of deps) {
    if (await cellar.has(rq)) continue
    needed.push(rq)
  }
  const wet = await resolve(needed)
  for (const pkg of wet) {
    const installation = await install(pkg)
    await link(installation)
  }
}
