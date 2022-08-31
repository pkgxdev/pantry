#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write=/opt/tea.xyz/tmp
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { parsePackage, semver, Path, PackageRequirement, PlainObject, parsePackageRequirement } from "types"
import usePantry from "hooks/usePantry.ts"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, isPlainObject } from "utils"
import { validatePackageRequirement } from "utils/lvl2.ts"
import useFlags from "hooks/useFlags.ts"
import useCellar from "hooks/useCellar.ts"
import hydrate from "prefab/hydrate.ts"

const { debug } = useFlags()

//TODO install any other deps

const pantry = usePantry()
const pkg = await (async () => {
  if (Deno.args[1] == "--magic") {
    const i = await useCellar().resolve(parsePackageRequirement(Deno.args[0]))
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
const deps: PackageRequirement[] = [self, ...await get_deps()]

const env = await useShellEnv(deps)

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

async function get_deps() {
  const rv: PackageRequirement[] = []
  attempt(yml.dependencies)
  attempt(yml.test.dependencies)
  return await hydrate(rv)

  function attempt(obj: PlainObject) {
    if (isPlainObject(obj))
    for (const [project, constraint] of Object.entries(obj)) {
      const pkg = validatePackageRequirement({ project, constraint })
      if (pkg) rv.push(pkg)
    }
  }
}
