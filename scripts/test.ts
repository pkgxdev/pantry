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

import { Installation, Package, PackageRequirement } from "types"
import { usePantry, useCellar, useFlags } from "hooks"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, pkg as pkgutils } from "utils"
import { resolve, install, hydrate, link } from "prefab"
import Path from "path"

const { debug } = useFlags()
const cellar = useCellar()
const pantry = usePantry()

for (const project of Deno.args) {
  const pkg = await (async () => {
    const match = project.match(/projects\/(.+)\/package.yml/)
    const parsable = match ? match[1] : project
    const pkg = pkgutils.parse(parsable)
    return await cellar.resolve(pkg)
  })()

  await test(pkg)
}

async function test(self: Installation) {
  const yml = await pantry.getYAML(self.pkg).parse()
  const deps = await deps4(self.pkg)
  const installations = await prepare(deps)
  const env = useShellEnv([self, ...installations])

  let text = undent`
    #!/bin/bash

    set -e
    set -o pipefail
    set -x

    ${expand(env.vars)}

    `

  const tmp = Path.mktmp({ prefix: pkgutils.str(self.pkg) })

  try {
    if (yml.test.fixture) {
      const fixture = tmp.join("fixture.tea").write({ text: yml.test.fixture.toString() })
      text += `export FIXTURE="${fixture}"\n\n`
    }

    const cwd = tmp.join("wd").mkdir()

    text += `cd "${cwd}"\n\n`

    text += await pantry.getScript(self.pkg, 'test', installations)
    text += "\n"

    for await (const [path, {name, isFile}] of pantry.getYAML(self.pkg).path.parent().ls()) {
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
}


//TODO install step in CI should do this for test requirements also
async function prepare(reqs: (Package | PackageRequirement)[]) {
  const { pending, installed } = await resolve(reqs)
  for await (const pkg of pending) {
    const installation = await install(pkg)
    await link(installation)
    installed.push(installation)
  }
  return installed
}

async function deps4(pkg: Package) {
  return (await hydrate(pkg, async (pkg, dry) => {
    const { runtime, test } = await pantry.getDeps(pkg)
    return dry ? [...runtime, ...test] : runtime
  })).pkgs
}
