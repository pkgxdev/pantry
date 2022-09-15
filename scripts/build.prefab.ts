import { Path, Package, PackageRequirement, semver } from "types"
import usePantry from "hooks/usePantry.ts"
import useCellar from "hooks/useCellar.ts"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent } from "utils"
import fix_pkg_config_files from "./fix-pkg-config-files.ts"
import fix_rpaths from "./fix-rpaths.ts"
import usePlatform from "hooks/usePlatform.ts"

interface Options {
  pkg: Package
  prebuild: () => Promise<void>
  deps: {
    // only include direct build-time dependencies
    build: PackageRequirement[]

    // include transitive dependencies
    runtime: PackageRequirement[]
  }
  /// additional env to set, will override (REPLACE) any calculated env
  env?: Record<string, string[]>
}

export default async function build({ pkg, deps, prebuild, env: add_env }: Options): Promise<Path> {
  const pantry = usePantry()
  const cellar = useCellar()
  const dst = cellar.mkpath(pkg)
  const src = dst.join("src")
  const env = await useShellEnv([...deps.runtime, ...deps.build])
  const sh = await pantry.getScript(pkg, 'build')

  if (cellar.prefix.string != "/opt") {
    console.error({ TEA_PREFIX: cellar.prefix.string })
    throw new Error("builds go to /opt (try TEA_PREFIX=/opt)")
  }

  if (env.pending.length) {
    console.error({uninstalled: env.pending})
    throw new Error("uninstalled")
  }

  await prebuild()

  if (add_env) {
    for (const [key, value] of Object.entries(add_env)) {
      env.vars[key] = value
    }
  }

  const cmd = dst.join("build.sh").write({ force: true, text: undent`
    #!/bin/bash

    set -e
    set -o pipefail
    set -x
    cd "${src}"

    ${expand(env.vars)}

    ${/*FIXME hardcoded paths*/ ''}
    export PATH=/opt/tea.xyz/var/pantry/scripts/brewkit:"$PATH"
    export PATH=/opt/tea.xyz/v0/bin:"$PATH"

    ${sh}
    `
  }).chmod(0o500)

  await run({ cmd })

  const installation = { pkg, path: dst }
  const self = {project: pkg.project, constraint: new semver.Range(`=${pkg.version}`)}

//// fix rpaths, etc.
  switch (usePlatform().platform) {
  case 'darwin': {
    const d = new Path(new URL(import.meta.url).pathname).parent()
    const walk = ['bin', 'lib', 'libexec'].map(x=>dst.join(x)).filter(x => x.isDirectory())
    await run({
      cmd: [d.join('fix-machos.rb'), dst, ...walk],
      env: {
        TEA_PREFIX: cellar.prefix.string,
      }
    })
  } break
  case 'linux':
    await fix_rpaths(installation, [...deps.runtime, self])
    break
  default:
    throw new Error("unsupported platform")
  }

//// fix rest of stuff
  await fix_pkg_config_files({ path: dst, pkg })

  return dst
}
