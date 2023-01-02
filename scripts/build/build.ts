import { useCellar, usePantry, usePrefix } from "hooks"
import { link, hydrate } from "prefab"
import { Installation, Package } from "types"
import useShellEnv, { expand } from "hooks/useShellEnv.ts"
import { run, undent, host, tuplize } from "utils"
import { str as pkgstr } from "utils/pkg.ts"
import fix_pkg_config_files from "./fix-pkg-config-files.ts"
import Path from "path"

const cellar = useCellar()
const pantry = usePantry()
const { platform } = host()

export interface BuildResult {
  installation: Installation
  src?: Path
}

export default async function _build(pkg: Package): Promise<BuildResult> {
  try {
    return await __build(pkg)
  } catch (e) {
    cellar.keg(pkg).isDirectory()?.isEmpty()?.rm()  // don’t leave empty kegs around
    throw e
  }
}

async function __build(pkg: Package): Promise<BuildResult> {
  const [deps, wet, resolved] = await calc_deps()
  await clean()
  const env = await mkenv()
  const dst = cellar.keg(pkg).mkpath()
  const [src, src_tarball] = await fetch_src(pkg) ?? []
  const installation = await build()
  await link(installation)
  await fix_binaries(installation)
  await fix_pkg_config_files(installation)
  return { installation, src: src_tarball }

//////// utils
  async function calc_deps() {
    const deps = await pantry.getDeps(pkg)
    const wet = await hydrate([...deps.runtime, ...deps.build])
    deps.runtime.push(...wet.pkgs)
    const resolved = await Promise.all(wet.pkgs.map(pkg => cellar.resolve(pkg)))
    return tuplize(deps, wet, resolved)
  }

  async function clean() {
    const installation = await should_clean()
    // If we clean deno.land, it breaks the rest of the process.
    if (installation && installation.pkg.project !== "deno.land") {
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
    const env = await useShellEnv({ installations: resolved})

    if (platform == 'darwin') {
      env['MACOSX_DEPLOYMENT_TARGET'] = ['11.0']
    }

    return env
  }

  async function build() {
    const bld = src ?? Path.mktmp({ prefix: pkg.project }).join("wd").mkdir()
    const sh = await pantry.getScript(pkg, 'build', resolved)

    const brewkit = new URL(import.meta.url).path().parent().parent().join("brewkit")

    const cmd = bld.parent().join("build.sh").write({ force: true, text: undent`
      #!/bin/bash

      set -e
      set -o pipefail
      set -x
      cd "${bld}"

      export SRCROOT="${bld}"
      ${expand(env)}

      export PATH=${brewkit}:"$PATH"

      ${sh}
      `
    }).chmod(0o700)

    // copy in auxillary files from pantry directory
    for await (const [path, {isFile}] of pantry.getYAML(pkg).path.parent().ls()) {
      if (isFile) {
        path.cp({ into: bld.join("props").mkdir() })
      }
    }

    await run({ cmd }) // WELCOME TO THE BUILD

    return { path: dst, pkg }
  }

  async function fix_binaries(installation: Installation) {
    const prefix = usePrefix().join("tea.xyz/var/pantry/scripts/brewkit")
    const env = {
      TEA_PREFIX: usePrefix().string,
    }
    switch (host().platform) {
    case 'darwin':
      return await run({
        cmd: [
          prefix.join('fix-machos.rb'),
          installation.path,
          ...['bin', 'lib', 'libexec'].map(x => installation.path.join(x)).filter(x => x.isDirectory())
        ],
        env
     })
    case 'linux':
      return await run({
        cmd: [
          prefix.join('fix-elf.ts'),
          installation.path,
          ...[...deps.runtime, pkg].map(pkgstr)
        ],
        env
      })
    }
  }
}

async function fetch_src(pkg: Package): Promise<[Path, Path] | undefined> {
  console.log('fetching', pkgstr(pkg))

  // we run this as a script because we don’t want these deps imported into *this* env
  // since that leads to situations where we depend on things we didn’t expect to
  const script = new URL(import.meta.url).path().parent().parent().join('fetch.ts')
  const proc = Deno.run({
    cmd: [script.string, pkgstr(pkg)],
    stdout: 'piped'
  })
  const [out, status] = await Promise.all([proc.output(), proc.status()])
  if (!status.success) throw new Error()
  const [dstdir, tarball] = new TextDecoder().decode(out).split("\n")
  if (!tarball) {
    // no tarball, e.g. tea.xyz/gx/cc
    return undefined
  }
  return [new Path(dstdir), new Path(tarball)]
}
