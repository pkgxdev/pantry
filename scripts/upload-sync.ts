#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-net
  - --allow-env=AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_S3_BUCKET,TEA_PREFIX
  - --import-map={{ srcroot }}/import-map.json
---*/

import { readAll, readerFromStreamReader } from "deno/streams/mod.ts"
import { useCache, useOffLicense } from "hooks"
import { Package } from "types"
import { Sha256 } from "deno/hash/sha256.ts"
import { S3 } from "s3"
import Path from "path"

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const offy = useOffLicense('s3')
const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)

for (const stowed of await useCache().ls()) {
  const url = offy.url(stowed)
  const key = offy.key(stowed)

  console.log({ checking: url })

  const inRepo = await bucket.headObject(key)
  const repoChecksum = inRepo ? await checksum(`${url}.sha256sum`) : undefined

  // path.read() returns a string; this is easier to get a UInt8Array
  const contents = await Deno.readFile(stowed.path.string)
  const sha256sum = new Sha256().update(contents).toString()

  if (!inRepo || repoChecksum !== sha256sum) {
    const basename = url.path().basename()
    const body = new TextEncoder().encode(`${sha256sum}  ${basename}`)

    console.log({ uploading: url })

    await bucket.putObject(key, contents)
    await bucket.putObject(`${key}.sha256sum`, body)

    console.log({ uploaded: url })
  }
}

async function checksum(url: string) {
  const rsp = await fetch(url)
  if (!rsp.ok) throw new Error(`404-not-found: ${url}`)
  const rdr = rsp.body?.getReader()
  if (!rdr) throw new Error(`Couldn’t read: ${url}`)
  const r = await readAll(readerFromStreamReader(rdr))
  return new TextDecoder().decode(r).split(' ')[0]
}

type RV = Package & {bottle: Path}
