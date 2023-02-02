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

const platform = Deno.env.get("PLATFORM") ?? panic("$PLATFORM not set")

let os: string | string[]
let buildOs: string | string[]
let testMatrix: { os: string | string[], container: string | undefined }[]

switch(platform) {
  case "darwin+x86-64":
    os = "macos-11"
    buildOs = ["self-hosted", "macOS", "X64"]
    testMatrix = [{ os, container: undefined }]
    break
  case "darwin+aarch64":
    os = ["self-hosted", "macOS", "ARM64"]
    buildOs = os
    testMatrix = [{ os, container: undefined }]
    break
  case "linux+aarch64":
    os = ["self-hosted", "linux", "ARM64"]
    buildOs = os
    testMatrix = [{ os, container: undefined }]
    break
  case "linux+x86-64":
    os = "ubuntu-latest"
    buildOs = ["self-hosted", "linux", "X64"]
    testMatrix = [
      { os, container: undefined },
      { os: buildOs, container: undefined },
      { os, container: "ghcr.io/teaxyz/infuser:latest" },
      { os, container: "debian:buster-slim" },
    ]
    break
  default:
    panic(`Invalid platform description: ${platform}`)
}

const output = `os=${JSON.stringify(os)}\n` +
  `build-os=${JSON.stringify(buildOs)}\n` +
  `test-matrix=${JSON.stringify(testMatrix)}\n`

Deno.stdout.write(new TextEncoder().encode(output))

if (Deno.env.get("GITHUB_OUTPUT")) {
  const envFile = Deno.env.get("GITHUB_OUTPUT")!
  await Deno.writeTextFile(envFile, output, { append: true})
}
