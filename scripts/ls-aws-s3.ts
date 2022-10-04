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
import SemVer, * as semver from "semver"
import { format }from "deno/datetime/mod.ts"

const sortByModified = Deno.args.includes("-m")
const reverse = Deno.args.includes("-r")
const fullMatrix = Deno.args.includes("-x")
const source = Deno.args.includes("-s")

if (source && fullMatrix) {
  throw new Error("incompatible flags (-x -s)")
}

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
})

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)

let output: FileInfo[] = []

for await(const obj of bucket.listAllObjects({ batchSize: 200 })) {
  const { key, lastModified } = obj
  if (!key?.match(/\.tar\.[gx]z$/)) { continue }
  output.push({ key: key!, lastModified: lastModified! })
}

if (fullMatrix) {
  produceMatrix(output)
} else {
  output = output.filter(x => {
    const match = x.key.match(new RegExp("/(darwin|linux)/(aarch64|x86-64)/v.*\.tar\.(x|g)z"))
    switch (source) {
      case true: return !match
      case false: return match
    }
  })

  output.sort((a, b) => {
    switch (sortByModified) {
      case true: return a.lastModified.valueOf() - b.lastModified.valueOf()
      case false: return a.key < b.key ? -1 : 1
    }
  })

  if (reverse) { output.reverse() }
  console.table(output)
}

interface FileInfo {
  key: string
  lastModified: Date
}

function produceMatrix(objects: FileInfo[]): void {
  const matrix = new Map()
  for (const { key, lastModified } of objects) {
    const match = key.match(new RegExp("(.*)/(darwin|linux)/(aarch64|x86-64)/v(.*)\.tar\.(x|g)z"))
    if (!match) continue
    const [_, project, _platform, _arch, _v] = match
    const flavor = `${_platform}/${_arch}`
    const version = semver.parse(_v)
    if (!version) continue
    const stats = matrix.get(project) || { project }

    if (version.gt(stats[flavor]?.[0] || new SemVer([0,0,0]))) {
      stats[flavor] = [version, format(lastModified, "yyyy-MM-dd HH:mm")]
    }

    matrix.set(project, stats)
  }

  const output = [...matrix.values()].map(o => ({
    project: o.project,
    'darwin/aarch64': `${o['darwin/aarch64']?.join(": ")}`,
    'darwin/x86-64': `${o['darwin/x86-64']?.join(": ")}`,
    'linux/aarch64': `${o['linux/aarch64']?.join(": ")}`,
    'linux/x86-64': `${o['linux/x86-64']?.join(": ")}`
  }))
  output.sort((a, b) => a.project < b.project ? -1: 1)
  console.table(output)
}
