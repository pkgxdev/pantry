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

import { parsePackage, semver, Path, PackageRequirement, parsePackageRequirement } from "types"
import usePantry from "hooks/usePantry.ts"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent } from "utils"
import useFlags from "hooks/useFlags.ts"
import useCellar from "hooks/useCellar.ts"
import resolve from "prefab/resolve.ts"
import install from "prefab/install.ts"
import hydrate from "prefab/hydrate.ts"
import { lvl1 as link } from "prefab/link.ts"

const { debug, magic } = useFlags()
const cellar = useCellar()
const pantry = usePantry()

const pkg = await (async () => {
  if (magic) {
    const i = await cellar.resolve(parsePackageRequirement(Deno.args[0]))
    return i.pkg
  } else {
    return parsePackage(Deno.args[0])
  }
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
    if (await cellar.isInstalled(rq)) continue
    needed.push(rq)
  }
  const wet = await resolve(needed)
  for (const pkg of wet) {
    const installation = install(pkg)
    await link(installation)
  }
}
