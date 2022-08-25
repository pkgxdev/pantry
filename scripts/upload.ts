#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-read=/opt
  - --allow-write=/opt/tea.xyz/var/www
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"
import { PackageRequirement, Path } from "types"
import useCache from "hooks/useCache.ts"
import useCellar from "hooks/useCellar.ts"
import { Package, parsePackageRequirement, SemVer, semver } from "types"
import useFlags from "hooks/useFlags.ts"

useFlags()

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3")!)
const cellar = useCellar()

const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()

const bottles = new Set<PackageRequirement>()
const checksums = new Set<string>()

for (const filename of Deno.args) {
  const path = new Path(filename).isFile()

  if (!path) { throw new Error(`${filename} is missing`)}

  if (path.basename() == "files.txt") { continue } // We don't need to upload this

  const match = path.basename().match(/(.*)-([0-9]+\.[0-9]+\.[0-9]+)\+.*\.tar\.gz.*/)

  if (!match)  { throw new Error(`${filename} doesn't appear to be our bottle/checksum`) }

  const req = parsePackageRequirement(`${match[1]}@${match[2]}`)

  if (path.basename().match(/\.sha256sum$/)) { checksums.add(`${req.project}@${req.constraint.raw}`) }
  else { bottles.add(req) }
}

// Ensure our sets are the same:
if (bottles.size !== checksums.size || ![...bottles].every(b => checksums.has(`${b.project}@${b.constraint.raw}`))) {
  throw new Error("bottles and checksums don't align")
}

for (const rq of bottles) {
  const {pkg} = await cellar.resolve(rq)
  const key = useCache().s3Key(pkg)
  const bottle = useCache().bottle(pkg)
  const checksum = new Path(`${bottle.string}.sha256sum`)

  console.log({ key });

  //FIXME stream it to S3
  const bottle_contents = await Deno.readFile(bottle.string)
  const checksum_contents = await Deno.readFile(checksum.string)
  const dirname = key.split("/").slice(0, -1).join("/")
  const versions = await get_versions(pkg)

  await bucket.putObject(key, bottle_contents)
  await bucket.putObject(`${key}.sha256sum`, checksum_contents)
  await bucket.putObject(`${dirname}/versions.txt`, encode(versions.join("\n")))

  console.log({ uploaded: key })
}

//end

import { dirname, basename } from "deno/path/mod.ts"

async function get_versions(pkg: Package): Promise<SemVer[]> {
  const prefix = dirname(useCache().s3Key(pkg))
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  const got = rsp
    ?.contents
    ?.compactMap(x => x.key)
    .map(x => basename(x))
    .compactMap(semver.coerce) //FIXME coerce is too loose
    ?? []

  // have to add pkg.version as put and get are not atomic
  return [...new Set([...got, pkg.version])].sort()
}
