import useCellar from "hooks/useCellar.ts"
import usePlatform from "hooks/usePlatform.ts"
import { Path, PackageRequirement, Installation } from "types"
import { runAndGetOutput,run } from "utils"


if (import.meta.main) {
  console.log(await get_rpaths(new Path(Deno.args[0])))
}


//TODO this is not resilient to upgrades (obv)
//NOTE solution is to have the rpath reference major version (or more specific if poss)

/// fix rpaths or install names for executables and dynamic libraries
export default async function fix_rpaths(installation: Installation, pkgs: PackageRequirement[]) {
  if (installation.pkg.project == "go.dev") {
    console.info("skipping rpath fixes for go.dev")
    // skipping because for some reason patchelf breaks the go binary
    // resulting in the only output being: `Segmentation Fault`
    return
  }
  console.info("doing SLOW rpath fixes…")
  for await (const [exename, type] of exefiles(installation.path)) {
    await set_rpaths(exename, type, pkgs, installation)
  }
}


//TODO it's an error if any binary has bad rpaths before bottling
//NOTE we should have a `safety-inspector` step before bottling to check for this sort of thing
//  and then have virtual env manager be more specific via (DY)?LD_LIBRARY_PATH
//FIXME somewhat inefficient for eg. git since git is mostly hardlinks to the same file
async function set_rpaths(exename: Path, type: 'exe' | 'lib', pkgs: PackageRequirement[], installation: Installation) {
  if (usePlatform().platform != 'linux') throw new Error()

  const cellar = useCellar()
  const our_rpaths = await Promise.all(pkgs.map(pkg => prefix(pkg)))

  const cmd = await (async () => {
    //FIXME we need this for perl
    // however really we should just have an escape hatch *just* for stuff that sets its own rpaths
    const their_rpaths = (await runAndGetOutput({
        cmd: ["patchelf", "--print-rpath", exename],
      }))
      .split(":")
      .compactMap(x => x.chuzzle())
      //^^ split has ridiculous empty string behavior

    const rpaths = [...their_rpaths, ...our_rpaths]
      .map(x => {
        const transformed = transform(x, installation)
        if (transformed.startsWith("$ORIGIN")) {
          console.warn("has own special rpath", transformed)
          return transformed
        } else {
          const rel_path = new Path(transformed).relative({ to: exename.parent() })
          return `$ORIGIN/${rel_path}`
        }
      })
      .uniq()
      .join(':')
      ?? []

    //FIXME use runtime-path since then LD_LIBRARY_PATH takes precedence which our virtual env manager requires
    return ["patchelf", "--force-rpath", "--set-rpath", rpaths, exename]
  })()

  if (cmd.length) {
    try {
      await run({ cmd })
    } catch (err) {
      console.warn(err)
      //FIXME allowing this error because on Linux:
      //    patchelf: cannot find section '.dynamic'. The input file is most likely statically linked
      // happens with eg. gofmt
      // and we don't yet have a good way to detect and skip such files
    }
  }

  async function prefix(pkg: PackageRequirement) {
    return (await cellar.resolve(pkg)).path.join("lib").string
  }
}

async function get_rpaths(exename: Path): Promise<string[]> {
  //GOOD_1ST_ISSUE better tokenizer for the output

  const lines = (await runAndGetOutput({
    cmd: ["otool", "-l", exename]
  }))
    .trim()
    .split("\n")
  const it = lines.values()
  const rv: string[] = []
  for (const line of it) {
    if (line.trim().match(/^cmd\s+LC_RPATH$/)) {
      it.next()
      rv.push(it.next().value.trim().match(/^path\s+(.+)$/)[1])

      console.debug(rv.slice(-1)[0])
    }
  }
  return rv
}

//FIXME pretty slow since we execute `file` for every file
// eg. perl has hundreds of `.pm` files in its `lib`
async function* exefiles(prefix: Path): AsyncGenerator<[Path, 'exe' | 'lib']> {
  for (const basename of ["bin", "lib", "libexec"]) {
    const d = prefix.join(basename).isDirectory()
    if (!d) continue
    for await (const [exename, { isFile, isSymlink }] of d.walk()) {
      if (!isFile || isSymlink) continue
      const type = await exetype(exename)
      if (type) yield [exename, type]
    }
  }
}

//FIXME lol use https://github.com/sindresorhus/file-type when we can
export async function exetype(path: Path): Promise<'exe' | 'lib' | false> {
  // speed this up a bit
  switch (path.extname()) {
    case ".py":
    case ".pyc":
    case ".pl":
      return false
  }

  const out = await runAndGetOutput({
    cmd: ["file", "--mime-type", path.string]
  })
  const lines = out.split("\n")
  const line1 = lines[0]
  if (!line1) throw new Error()
  const match = line1.match(/: (.*)$/)
  if (!match) throw new Error()
  const mime = match[1]

  console.debug(mime)

  switch (mime) {
  case 'application/x-pie-executable':
  case 'application/x-mach-binary':
  case 'application/x-executable':
    return 'exe'

  case 'application/x-sharedlib':
    return 'lib'
  default:
    return false
  }
}

// convert a full version path to a major’d version path
// this so we are resilient to upgrades without requiring us to rewrite binaries on install
// since rewriting binaries would invalidate our signatures
function transform(input: string, installation: Installation) {
  if (input.startsWith("$ORIGIN")) {
    // we leave these alone, trusting the build tool knew what it was doing
    return input
  } else if (input.startsWith(installation.path.parent().string)) {
    // don’t transform stuff that links to this actual package
    return input
  } else {
    //FIXME not very robust lol
    return input.replace(/v(\d+)\.\d+\.\d+/, 'v$1')
  }
}
