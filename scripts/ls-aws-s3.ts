#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-env
  - --allow-net
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"

const sortByModified = Deno.args.includes("-m")
const reverse = Deno.args.includes("-r")

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)

const output: FileInfo[] = []

for await(const obj of bucket.listAllObjects({ batchSize: 200 })) {
  const { key, lastModified } = obj
  if (!key?.match(/\.tar.gz$/)) { continue }
  output.push({ key: key!, lastModified: lastModified! })
}

output.sort((a, b) => {
  switch (sortByModified) {
    case true: return a.lastModified.valueOf() - b.lastModified.valueOf()
    case false: return a.key < b.key ? -1 : 1
  }
})

if (reverse) { output.reverse() }

console.table(output)

interface FileInfo {
  key: string
  lastModified: Date
}