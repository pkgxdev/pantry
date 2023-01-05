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

import { S3, S3Bucket } from "s3"
import { pkg as pkgutils } from "utils"
import { useCache, useFlags, useOffLicense, usePrefix } from "hooks"
import { Package, PackageRequirement } from "types"
import SemVer, * as semver from "semver"
import { basename, dirname } from "deno/path/mod.ts"
import { decode as base64Decode } from "deno/encoding/base64.ts"
import Path from "path"
import { set_output } from "./utils/gha.ts"
import { sha256 } from "./bottle.ts"

//------------------------------------------------------------------------- funcs
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
    if (value.startsWith("--")) return rv
    rv.push(value)
  }
}

function assert_pkg(pkg: Package | PackageRequirement) {
  if ("version" in pkg) {
    return pkg
  } else {
    return {
      project: pkg.project,
      version: new SemVer(pkg.constraint),
    }
  }
}

async function get_versions(key: string, pkg: Package, bucket: S3Bucket): Promise<SemVer[]> {
  const prefix = dirname(key)
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  const got = rsp
    ?.contents
    ?.compact((x) => x.key)
    .map((x) => basename(x))
    .filter((x) => x.match(/v.*\.tar\.gz$/))
    .map((x) => x.replace(/v(.*)\.tar\.gz/, "$1")) ??
    []

  // have to add pkg.version as put and get are not atomic
  return [...new Set([...got, pkg.version.toString()])]
    .compact(semver.parse)
    .sort(semver.compare)
}

async function put(key: string, body: string | Path | Uint8Array, bucket: S3Bucket) {
  console.log({ uploading: body, to: key })
  rv.push(`/${key}`)
  if (body instanceof Path) {
    body = await Deno.readFile(body.string)
  } else if (typeof body === "string") {
    body = encode(body)
  }
  return bucket.putObject(key, body)
}

//------------------------------------------------------------------------- main
useFlags()

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)
const encode = (() => {
  const e = new TextEncoder()
  return e.encode.bind(e)
})()
const cache = useCache()

const pkgs = args_get("pkgs").map(pkgutils.parse).map(assert_pkg)
const srcs = args_get("srcs")
const bottles = args_get("bottles")
const checksums = args_get("checksums")
const signatures = args_get("signatures")

const rv: string[] = []

for (const [index, pkg] of pkgs.entries()) {
  const bottle = usePrefix().join(bottles[index])
  const checksum = checksums[index]
  const signature = base64Decode(signatures[index])
  const stowed = cache.decode(bottle)!
  const key = useOffLicense("s3").key(stowed)
  const versions = await get_versions(key, pkg, bucket)

  //FIXME stream the bottle (at least) to S3
  await put(key, bottle, bucket)
  await put(`${key}.sha256sum`, `${checksum}  ${basename(key)}`, bucket)
  await put(`${key}.asc`, signature, bucket)
  await put(`${dirname(key)}/versions.txt`, versions.join("\n"), bucket)

  // mirror the sources
  if (srcs[index] != "~") {
    const src = usePrefix().join(srcs[index])
    if (src.isDirectory()) {
      // we almost certainly expanded `~` to the user’s home directory
      continue
    }
    const srcKey = useOffLicense("s3").key({
      pkg: stowed.pkg,
      type: "src",
      extname: src.extname(),
    })
    const srcChecksum = await sha256(src)
    const srcVersions = await get_versions(srcKey, pkg, bucket)
    await put(srcKey, src, bucket)
    await put(`${srcKey}.sha256sum`, `${srcChecksum}  ${basename(srcKey)}`, bucket)
    await put(`${dirname(srcKey)}/versions.txt`, srcVersions.join("\n"), bucket)
  }
}

await set_output("cf-invalidation-paths", rv)
