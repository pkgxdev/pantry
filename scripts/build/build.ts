import { useSourceUnarchiver, useCellar, usePantry, useCache, usePrefix } from "hooks"
import { link, hydrate } from "prefab"
import { Installation, Package } from "types"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, host, pkg as pkgutils } from "utils"
import fix_pkg_config_files from "./fix-pkg-config-files.ts"
import fix_linux_rpaths from "./fix-linux-rpaths.ts"
import Path from "path"
import * as semver from "semver"

const cellar = useCellar()
const pantry = usePantry()
const { platform } = host()

export default async function _build(pkg: Package) {
  try {
    await __build(pkg)
  } catch (e) {
    cellar.keg(pkg).isEmpty()?.rm()  // don’t leave empty kegs around
    throw e
  }
}

async function __build(pkg: Package) {
  const [deps, wet] = await calc_deps()
  await clean()
  const env = await mkenv()
  const dst = cellar.keg(pkg).mkpath()
  const src = await fetch_src(pkg)
  const installation = await build()
  await link(installation)
  await fix_binaries(installation)
  await fix_pkg_config_files(installation)
  return installation

//////// utils
  async function calc_deps() {
    const deps = await pantry.getDeps(pkg)
    const wet = await hydrate([...deps.runtime, ...deps.build], pkg => pantry.getDeps(pkg).then(x => x.runtime))
    deps.runtime.push(...wet.pkgs)
    // deno-lint-ignore no-explicit-any
    function tuplize<T extends any[]>(...elements: T) { return elements }
    return tuplize(deps, wet)
  }

  async function clean() {
    const installation = await should_clean()
    if (installation) {
      console.log({ cleaning: installation.path })
      for await (const [path] of installation.path.ls()) {
        // we delete contents rather than the directory itself to prevent broken vx.y symlinks
        path.rm({ recursive: true })
      }
    }

    async function should_clean() {
      // only required as we aren't passing everything into hydrate
      const depends_on_self = () => deps.build.some(x => x.project === pkg.project)
      const wet_dep = () => wet.pkgs.some(x => x.project === pkg.project)

      // provided this package doesn't transitively depend on itself (yes this happens)
      // clean out the destination prefix first
      if (!wet.bootstrap_required.has(pkg.project) && !depends_on_self() && !wet_dep()) {
        return await cellar.has(pkg)
      }
    }
  }

  async function mkenv() {
    const env = await useShellEnv([...deps.runtime, ...deps.build])

    if (env.pending.length) {
      console.error({uninstalled: env.pending.map(pkgutils.str)})
      throw new Error("uninstalled")
    }

    if (platform == 'darwin') {
      env.vars['MACOSX_DEPLOYMENT_TARGET'] = ['11.0']
    }

    return env
  }

  async function build() {
    const sh = await pantry.getScript(pkg, 'build')

    const cmd = src.parent().join("build.sh").write({ force: true, text: undent`
      #!/bin/bash

      set -e
      set -o pipefail
      set -x
      cd "${src}"

      ${expand(env.vars)}

      ${/*FIXME hardcoded paths*/ ''}
      export PATH=/opt/tea.xyz/var/pantry/scripts/brewkit:"$PATH"

      ${sh}
      `
    }).chmod(0o500)

    await run({ cmd }) // THE BUILD

    return { path: dst, pkg }
  }

  async function fix_binaries(installation: Installation) {
    switch (host().platform) {
    case 'darwin':
      await fix_macho(installation)
      break
    case 'linux': {
      const self = {project: pkg.project, constraint: new semver.Range(`=${pkg.version}`)}
      await fix_linux_rpaths(installation, [...deps.runtime, self])
    }}
  }
}

async function fetch_src(pkg: Package): Promise<Path> {
  const dstdir = usePrefix().join(pkg.project, "src", `v${pkg.version}`)
  const { url, stripComponents } = await pantry.getDistributable(pkg)
  const zipfile = await useCache().download({ pkg, url, type: 'src' })
  await useSourceUnarchiver().unarchive({ dstdir, zipfile, stripComponents })
  return dstdir
}

async function fix_macho(installation: Installation) {
  const d = new Path(new URL(import.meta.url).pathname).parent()
  const walk = ['bin', 'lib', 'libexec'].map(x => installation.path.join(x)).filter(x => x.isDirectory())
  await run({
    cmd: [d.join('fix-machos.rb'), installation.path, ...walk],
    env: {
      TEA_PREFIX: usePrefix().string,
    }
  })
}
