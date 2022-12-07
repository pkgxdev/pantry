#!/usr/bin/env -S tea -E

/* ---
dependencies:
  gnu.org/tar: ^1.34
  tukaani.org/xz: ^5
  zlib.net: 1
  gnupg.org: ^2
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-env
  - --allow-read
  - --allow-write
  - --import-map={{ srcroot }}/import-map.json
--- */

import { Installation } from "types"
import { useCellar, usePrefix, useFlags, useCache } from "hooks"
import { backticks, panic, run } from "utils"
import { crypto } from "deno/crypto/mod.ts"
import { encode } from "deno/encoding/hex.ts"
import { encode as base64Encode } from "deno/encoding/base64.ts"
import { set_output } from "./utils/gha.ts"
import * as ARGV from "./utils/args.ts"
import Path from "path"

const cellar = useCellar()


//-------------------------------------------------------------------------- main

if (import.meta.main) {
  useFlags()

  const compression = Deno.env.get("COMPRESSION") == 'xz' ? 'xz' : 'gz'
  const gpgKey = Deno.env.get("GPG_KEY_ID") ?? panic("missing GPG_KEY_ID")
  const gpgPassphrase = Deno.env.get("GPG_PASSPHRASE") ?? panic("missing GPG_PASSPHRASE")
  const checksums: string[] = []
  const signatures: string[] = []
  const bottles: Path[] = []

  for await (const pkg of ARGV.pkgs()) {
    console.log({ bottling: pkg })

    const installation = await cellar.resolve(pkg)
    const path = await bottle(installation, compression)
    const checksum = await sha256(path)
    const signature = await gpg(path, { gpgKey, gpgPassphrase })

    console.log({ bottled: path })

    bottles.push(path)
    checksums.push(checksum)
    signatures.push(signature)
  }

  await set_output("bottles", bottles.map(b => b.relative({ to: usePrefix() })))
  await set_output("checksums", checksums)
  await set_output("signatures", signatures)
}


//------------------------------------------------------------------------- funcs
export async function bottle({ path: kegdir, pkg }: Installation, compression: 'gz' | 'xz'): Promise<Path> {
  const tarball = useCache().path({ pkg, type: 'bottle', compression })
  const z = compression == 'gz' ? 'z' : 'J'
  const cwd = usePrefix()
  const cmd = ["tar", `c${z}f`, tarball, kegdir.relative({ to: cwd })]
  await run({ cmd, cwd })
  return tarball
}

export async function sha256(file: Path): Promise<string> {
  return await Deno.open(file.string, { read: true })
    .then(file => crypto.subtle.digest("SHA-256", file.readable))
    .then(buf => new TextDecoder().decode(encode(new Uint8Array(buf))))
}

interface GPGCredentials {
  gpgKey: string
  gpgPassphrase: string
}

async function gpg(file: Path, { gpgKey, gpgPassphrase }: GPGCredentials): Promise<string> {
  const rv = await backticks({
    cmd: [
      "gpg",
      "--detach-sign",
      "--armor",
      "--output",
      "-",
      "--local-user",
      gpgKey,
      "--passphrase",
      gpgPassphrase,
      file.string
    ]
  })
  return base64Encode(rv)
}