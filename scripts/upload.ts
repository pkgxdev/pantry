#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-read=/opt
  - --allow-env=AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_S3
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"
import { crypto } from "deno/crypto/mod.ts"
import useCache from "hooks/useCache.ts"
import useCellar from "hooks/useCellar.ts"
import { encodeToString } from "encodeToString"
import { Package, parsePackageRequirement, SemVer, semver } from "types"

if (Deno.args.length === 0) throw new Error("no args supplied")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3")!)
const cellar = useCellar()

for (const rq of Deno.args.map(parsePackageRequirement)) {
  const {pkg} = await cellar.resolve(rq)
  const key = useCache().s3Key(pkg)
  const bottle = useCache().bottle(pkg)

  console.log({ key });

  //FIXME stream it to S3
  const bottle_contents = await Deno.readFile(bottle.string)
  const encode = (() => { const e = new TextEncoder(); return e.encode.bind(e) })()
  const [basename, dirname] = (split => [split.pop(), split.join("/")])(key.split("/"))
  const checksum = encodeToString(new Uint8Array(await crypto.subtle.digest("SHA-256", bottle_contents)))
  const versions = await get_versions(pkg)

  await bucket.putObject(key, bottle_contents)
  await bucket.putObject(`${key}.sha256sum`, encode(`${checksum}  ${basename}`))
  await bucket.putObject(`${dirname}/versions.txt`, encode(versions.join("\n")))

  console.log({ uploaded: key })
}

async function get_versions(pkg: Package): Promise<SemVer[]> {
  const prefix = useCache().s3Key(pkg)
  const rsp = await bucket.listObjects({ prefix })

  //FIXME? API isn’t clear if these nulls indicate failure or not
  //NOTE if this is a new package then some empty results is expected
  return rsp
    ?.contents
    ?.compactMap(x => x.key?.split("/").pop())
    .compactMap(semver.coerce) //FIXME coerce is too loose
    .sort() ?? []
}
