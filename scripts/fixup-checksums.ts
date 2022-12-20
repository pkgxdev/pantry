#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-env=AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_S3_BUCKET
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3, S3Object } from "s3"
import { Sha256 } from "deno/hash/sha256.ts"
import { readerFromStreamReader, readAll } from "deno/streams/conversion.ts"
import Path from "path"

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
});

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!);

for await (const pkg of bucket.listAllObjects({ batchSize: 200 })) {
  const keys = get_keys(pkg)
  if (!keys) continue

  console.log({ checking: keys.checksum });

  if (!await bucket.headObject(keys.checksum.string)) {
    console.log({ missing: keys.checksum })

    const reader = (await bucket.getObject(keys.bottle.string))!.body.getReader()
    const contents = await readAll(readerFromStreamReader(reader))
    const sha256sum = new Sha256().update(contents).toString()
    const body = new TextEncoder().encode(`${sha256sum}  ${keys.bottle.basename()}`)
    await bucket.putObject(keys.checksum.string, body)

    console.log({ uploaded: keys.checksum })
  }
}

function get_keys(pkg: S3Object): { bottle: Path, checksum: Path } | undefined {
  if (!pkg.key) return
  if (!/\.tar\.[gx]z$/.test(pkg.key)) return
  return {
    bottle: new Path(pkg.key),
    checksum: new Path(`${pkg.key}.sha256sum`)
  }
}