#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-write
  - --import-map={{ srcroot }}/import-map.json
---*/

import * as ARGV from "./utils/args.ts"

const exceptions: { [pkg: string]: number } = {
  "deno.land": 4,
  "ziglang.org": 8,
}

const pkgs = await ARGV.toArray(ARGV.pkgs())

let coreSize = 2

for (const pkg of pkgs) {
  coreSize = Math.max(exceptions[pkg.project] || 2, coreSize)
}

const output = `GHA_LINUX_BUILD_SIZE=${imageName(coreSize)}\n`

Deno.stdout.write(new TextEncoder().encode(output))

if (Deno.env.get("GITHUB_ENV")) {
  const envFile = Deno.env.get("GITHUB_ENV")!
  await Deno.writeTextFile(envFile, output, { append: true})
}

function imageName(size: number) {
  switch (size) {
    case 0:
    case 1:
    case 2:
      return "ubuntu-latest"
    case 4:
    case 8:
    case 16:
      return `ubuntu-latest-${size}-cores`
    default:
      throw new Error("Invalid core size")
  }
}