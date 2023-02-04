#!/usr/bin/env tea

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-write
---*/

import { panic } from "utils";

type Output = {
  os: OS,
  buildOs: OS,
  container?: string,
  testMatrix: { os: OS, container?: string }[]
  cacheSet: string
}

type OS = string | string[]

const platform = Deno.env.get("PLATFORM") ?? panic("$PLATFORM not set")

const cacheSets = {
  "darwin": "$HOME/Library/Caches/deno/deps/https/",
  "linux": "$HOME/.cache/deno/deps/https/"
}

const output: Output = (() => {
  switch(platform) {
  case "darwin+x86-64": {
    // Using GHA resources for now, until we resolve network issues with our runners
    // buildOs: ["self-hosted", "macOS", "X64"]
    const os = "macos-11"
    return {
      os,
      buildOs: os,
      testMatrix: [{ os }],
      cacheSet: cacheSets["darwin"]
    }
  }
  case "darwin+aarch64": {
    const os = ["self-hosted", "macOS", "ARM64"]
    return {
      os,
      buildOs: os,
      testMatrix: [{ os }],
      cacheSet: cacheSets["darwin"]
    }
  }
  case "linux+aarch64": {
    const os = ["self-hosted", "linux", "ARM64"]
    return {
      os,
      buildOs: os,
      testMatrix: [{ os }],
      cacheSet: cacheSets["linux"]
    }
  }
  case "linux+x86-64": {
    // Using GHA resources for now, until we resolve network issues with our runners
    // buildOs: ["self-hosted", "linux", "X64"]
    // testMatrix.push({ os: buildOs, container: undefined })
    const os = "ubuntu-latest"
    const container = "ghcr.io/teaxyz/infuser:latest"
    return { os,
      buildOs: os,
      container,
      testMatrix: [
        { os },
        { os, container },
        { os, container: "debian:buster-slim" }
      ],
      cacheSet: cacheSets["linux"]
    }
  }
  default:
    panic(`Invalid platform description: ${platform}`)
}})()

const rv = `os=${JSON.stringify(output.os)}\n` +
  `build-os=${JSON.stringify(output.buildOs)}\n` +
  `container=${JSON.stringify(output.container)}\n` +
  `test-matrix=${JSON.stringify(output.testMatrix)}\n` +
  `cache-set=${JSON.stringify(output.cacheSet)}\n`

Deno.stdout.write(new TextEncoder().encode(rv))

if (Deno.env.get("GITHUB_OUTPUT")) {
  const envFile = Deno.env.get("GITHUB_OUTPUT")!
  await Deno.writeTextFile(envFile, rv, { append: true})
}
