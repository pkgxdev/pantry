#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-read
  - --allow-env=AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_S3_BUCKET
  - --import-map={{ srcroot }}/import-map.json
---*/

import { S3 } from "s3"
import { stringify as yaml } from "deno/encoding/yaml.ts"
import { stringify as csv } from "deno/encoding/csv.ts"
import { Inventory } from "hooks/useInventory.ts"
import SemVer, * as semver from "semver"

const s3 = new S3({
  accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
  secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
  region: "us-east-1",
});

const bucket = s3.getBucket(Deno.env.get("AWS_S3_BUCKET")!)

const inventory: Inventory = {}
const flat = []

for await (const pkg of bucket.listAllObjects({ batchSize: 200 })) {
  if (!/\.tar\.[gx]z$/.test(pkg.key ?? '')) { continue }

  const matches = pkg.key!.match(new RegExp(`^(.*)/(.*)/(.*)/v(${semver.regex.source})\.tar\.[xg]z$`))
  if (!matches) { continue }

  const [_, project, platform, arch, version] = matches

  if (!inventory[project]) inventory[project] = {}
  if (!inventory[project][platform]) inventory[project][platform] = {}
  if (!inventory[project][platform]) inventory[project][platform] = {}
  inventory[project][platform][arch] = [...(inventory[project]?.[platform]?.[arch] ?? []), version]
  flat.push({ project, platform, arch, version })
}

/// For ultimate user-friendliness, we store this data 4 ways:
/// YAML, JSON, CSV, flat text

const te = new TextEncoder()

// YAML: type Inventory

const yml = te.encode(yaml(inventory))

bucket.putObject("versions.yml", yml)

// JSON: type Inventory

const json = te.encode(JSON.stringify(inventory))

bucket.putObject("versions.json", json)

// CSV: project,platform,arch,version

const csvData = te.encode(csv(flat, { columns: ["project", "platform", "arch", "version"]}))

bucket.putObject("versions.csv", csvData)

// TXT: per project/platform/arch, newline-delimited

for(const [project, platforms] of Object.entries(inventory)) {
  for (const [platform, archs] of Object.entries(platforms)) {
    for (const [arch, versions] of Object.entries(archs)) {
      const v = versions.map(x => new SemVer(x)).sort(semver.compare)
      const txt = te.encode(v.join("\n"))
      console.log(project, platform, arch, v)
      bucket.putObject(`${project}/${platform}/${arch}/versions.txt`, txt)
    }
  }
}

//end
