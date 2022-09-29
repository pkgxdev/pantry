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
import { pkg as pkgutils } from "utils"
import { useFlags, useOffLicense, useCache } from "hooks"
import { Package, PackageRequirement } from "types"
import SemVer, * as semver from "semver"
import { dirname, basename } from "deno/path/mod.ts"
import Path from "path"
import { set_output } from "./utils/gha.ts"

useFlags()

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)
const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()
const cache = useCache()

const pkgs = args_get("pkgs").map(pkgutils.parse).map(assert_pkg)
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

const rv: string[] = []
const put = async (key: string, body: string | Path | Uint8Array) => {
  console.log({ uploading: body, to: key })
  rv.push(`/${key}`)
  if (body instanceof Path) {
    body = await Deno.readFile(body.string)
  } else if (typeof body === "string") {
    body = encode(body)
  }
  return bucket.putObject(key, body)
}

for (const [index, pkg] of pkgs.entries()) {
  const bottle = new Path(bottles[index])
  const checksum = checksums[index]
  const stowed = cache.decode(bottle)!
  const key = useOffLicense('s3').key(stowed)
  const versions = await get_versions(key, pkg)

  //FIXME stream the bottle (at least) to S3
  await put(key, bottle)
  await put(`${key}.sha256sum`, `${checksum}  ${basename(key)}`)
  await put(`${dirname(key)}/versions.txt`, versions.join("\n"))
}

await set_output('cf-invalidation-paths', rv)

//end

async function get_versions(key: string, pkg: Package): Promise<SemVer[]> {
  const prefix = dirname(key)
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  const got = rsp
    ?.contents
    ?.compact(x => x.key)
    .map(x => basename(x))
    .filter(x => x.match(/v.*\.tar\.gz$/))
    .map(x => x.replace(/v(.*)\.tar\.gz/, "$1"))
    ?? []

  // have to add pkg.version as put and get are not atomic
  return [...new Set([...got, pkg.version.toString()])]
    .compact(semver.parse)
    .sort(semver.compare)
}

function assert_pkg(pkg: Package | PackageRequirement) {
  if ("version" in pkg) {
    return pkg
  } else {
    return {
      project: pkg.project,
      version: new SemVer(pkg.constraint)
    }
  }
}
