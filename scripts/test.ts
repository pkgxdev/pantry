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

import { parsePackage, semver, Path, PackageRequirement, PlainObject } from "types"
import usePantry from "hooks/usePantry.ts"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, isPlainObject } from "utils"
import { validatePackageRequirement } from "utils/lvl2.ts"
import useFlags from "hooks/useFlags.ts"

useFlags()

//TODO install any other deps

const pantry = usePantry()
const pkg = parsePackage(Deno.args[0])
const self = {
  project: pkg.project,
  constraint: new semver.Range(pkg.version.toString())
}
const [yml] = await pantry.getYAML(pkg)
const deps: PackageRequirement[] = [self, ...get_deps()]

const env = await useShellEnv(deps)

let text = undent`
  #!/bin/bash

  set -e
  set -o pipefail
  set -x

  ${expand(env.vars)}

  `

const tmp = Path.mktemp()

try {
  if (yml.test.fixture) {
    const fixture = tmp.join("fixture.tea").write({ text: yml.test.fixture.toString() })
    text += `export FIXTURE="${fixture}"\n\n`
  }

  text += await pantry.getScript(pkg, 'test')
  text += "\n"

  const cmd = tmp
    .join("test.sh")
    .write({ text, force: true })
    .chmod(0o500)
  await run({ cmd })
} finally {
  tmp.rm({ recursive: true })
}

function get_deps() {
  const rv: PackageRequirement[] = []
  attempt(yml.dependencies)
  attempt(yml.test.dependencies)
  return rv

  function attempt(obj: PlainObject) {
    if (isPlainObject(obj))
    for (const [project, constraint] of Object.entries(obj)) {
      const pkg = validatePackageRequirement({ project, constraint })
      if (pkg) rv.push(pkg)
    }
  }
}
