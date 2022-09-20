#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"
import { parse_pkg } from "utils"
import { useCache, useFlags } from "hooks"
import { Package } from "types"
import SemVer, * as semver from "semver"
import { dirname, basename } from "deno/path/mod.ts"

useFlags()

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)

const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()

const pkgs = args_get("pkgs").map(parse_pkg)
const bottles = args_get("bottles")
const checksums = args_get("checksums")

function args_get(key: string): string[] {
  const it = Deno.args[Symbol.iterator]()
  while (true) {
    const { value, done } = it.next()
    if (done) throw new Error()
    if (value === `--${key}`) break
  }
  const rv: string[] = []
  while (true) {
    const { value, done } = it.next()
    if (done) return rv
    if (value.startsWith('--')) return rv
    rv.push(value)
  }
}

for (const [index, pkg] of pkgs.entries()) {
  const bottle = bottles[index]
  const checksum = checksums[index]
  const key = useCache().s3Key(pkg)

  //FIXME stream it to S3
  const bottle_contents = await Deno.readFile(bottle)
  const checksum_contents = fixup_checksum(await Deno.readFile(checksum), basename(bottle))
  const versions = await get_versions(pkg)

  console.log({ uploading: key })

  await bucket.putObject(key, bottle_contents)
  await bucket.putObject(`${key}.sha256sum`, checksum_contents)
  await bucket.putObject(`${dirname(key)}/versions.txt`, encode(versions.join("\n")))

  console.log({ uploaded: key })
}

//end

async function get_versions(pkg: Package): Promise<SemVer[]> {
  const prefix = dirname(useCache().s3Key(pkg))
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  const got = rsp
    ?.contents
    ?.compact_map(x => x.key)
    .map(x => basename(x))
    .compact_map(semver.coerce) //FIXME coerce is too loose
    ?? []

  // have to add pkg.version as put and get are not atomic
  return [...new Set([...got, pkg.version])].sort()
}

// Somewhat hacky. We call the bottle on thing locally, and another on the server.
function fixup_checksum(data: Uint8Array, new_file_name: string) {
  const checksum = new TextDecoder().decode(data).split("  ")[0]
  return new TextEncoder().encode(`${checksum}  ${new_file_name}`)
}