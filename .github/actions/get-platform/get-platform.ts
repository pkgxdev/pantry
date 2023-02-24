#!/usr/bin/env tea

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-write
---*/

import { panic } from "utils"

// These are only needed if we switch back to GHA runners

// const exceptions: { [project: string]: number } = {
//   "deno.land": 4,
//   "ziglang.org": 8,
// }

// const packages = await ARGV.toArray(ARGV.pkgs())

type Output = {
  os: OS,
  buildOs: OS,
  container?: string,
  testMatrix: { os: OS, container?: string }[]
}

type OS = string | string[]

const platform = Deno.env.get("PLATFORM") ?? panic("$PLATFORM not set")


const output: Output = (() => {
  switch(platform) {
  case "darwin+x86-64": {
    const os = "macos-11"
    return {
      os,
      buildOs: ["self-hosted", "macOS", "X64"],
      testMatrix: [{ os }],
    }
  }
  case "darwin+aarch64": {
    const os = ["self-hosted", "macOS", "ARM64"]
    return {
      os,
      buildOs: os,
      testMatrix: [{ os }],
    }
  }
  case "linux+aarch64": {
    const os = ["self-hosted", "linux", "ARM64"]
    return {
      os,
      buildOs: os,
      testMatrix: [{ os }],
    }
  }
  case "linux+x86-64": {
    // buildOs: sizedUbuntu(packages),
    const os = "ubuntu-latest"
    const container = "ghcr.io/teaxyz/infuser:latest"
    return {
      os,
      buildOs: ["self-hosted", "linux", "X64"],
      // container,
      testMatrix: [
        { os },
        { os, container },
        { os, container: "debian:buster-slim" }
      ],
    }
  }
  default:
    panic(`Invalid platform description: ${platform}`)
}})()

const rv = `os=${JSON.stringify(output.os)}\n` +
  `build-os=${JSON.stringify(output.buildOs)}\n` +
  `container=${JSON.stringify(output.container)}\n` +
  `test-matrix=${JSON.stringify(output.testMatrix)}\n`

Deno.stdout.write(new TextEncoder().encode(rv))

if (Deno.env.get("GITHUB_OUTPUT")) {
  const envFile = Deno.env.get("GITHUB_OUTPUT")!
  await Deno.writeTextFile(envFile, rv, { append: true})
}

// Leaving this in case we need to switch back to GHA runners

// function sizedUbuntu(packages: (Package | PackageRequirement)[]): string {
//   const size = Math.max(2, ...packages.map(p => exceptions[p.project] ?? 2))

//   if (size == 2) {
//     return "ubuntu-latest"
//   } else if ([4, 8, 16].includes(size)) {
//     return `ubuntu-latest-${size}-cores`
//   } else {
//     panic(`Invalid size: ${size}`)
//   }
// }