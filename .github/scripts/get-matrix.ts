#!/usr/bin/env -S pkgx deno run -A

import { hooks, utils } from "pkgx"
import { isString, isArray } from "is-what"

const pkg = utils.pkg.parse(Deno.args[0])
const config = await get_config(pkg)

const rv = {} as Record<string, any>
for (const platform of config.platforms) {
  const key = platform.replace('/', '+')
  rv[key] = get_matrix(platform)
}

const ghout = Deno.env.get("GITHUB_OUTPUT")
if (ghout) {
  const json = JSON.stringify(Object.values(rv))
  Deno.writeTextFileSync(ghout, `matrix=${json}`, {append: true})
} else {
  const json = JSON.stringify(rv, null, 2)
  console.log(json)
}

///////////////////////////////////////////////////////////////////////

//TODO should be in libpkgx!
async function get_config(pkg: {project: string}) {
  let { platforms, test } = await hooks.usePantry().project(pkg).yaml()
  const get_platforms = (() => {
    if (!platforms) return ["linux/x86-64", "linux/aarch64", "darwin/x86-64", "darwin/aarch64"]
    if (isString(platforms)) platforms = [platforms]
    if (!isArray(platforms)) throw new Error(`invalid platform node: ${platforms}`)
    const rv = []
    for (const platform of platforms) {
      if (platform.match(/^(linux|darwin)\/(aarch64|x86-64)$/)) rv.push(platform)
      else if (platform.match(/^(linux|darwin)$/)) rv.push(`${platform}/x86-64`, `${platform}/aarch64`)
      else throw new Error(`invalid platform: ${platform}`)
    }
    return rv
  })

  const qaRequired = test?.["qa-required"] === true

  return {
    platforms: get_platforms(),
    qaRequired
  }
}

// https://github.com/actions/runner-images#available-images
function get_matrix(platform: string) {
  const name = platform.replace('/', '+')
  switch (platform) {
    case 'darwin/aarch64': {
      const os = ["self-hosted", "macOS", "ARM64"]
      return {
        os, name,
        "test-os": [os],
        "test-container": [null],
        tinyname: "²"
      }}
    case 'darwin/x86-64': {
      const os = ["self-hosted", "macOS", "X64"]
      return {
        os, name,
        "test-os": ["macos-13", "macos-14-large", "macos-15-large"],
        "test-container": [null],
        tinyname: "x64"
      }}
    case 'linux/x86-64': {
      const os = {group: "linux-x86-64"}
      return {
        os, name,
        container: "debian:buster-slim",
        "test-os": [os],
        "test-container": ["debian:buster-slim", "ubuntu", "archlinux:base-20250209.0.306672"],
        tinyname: "*nix64"
      }}
    case 'linux/aarch64': {
      const os = ["self-hosted", "linux", "ARM64"]
      return {
        os, name,
        "test-os": [os],
        "test-container": [null],
        tinyname: "*nix·ARM64"
  }}}
}
