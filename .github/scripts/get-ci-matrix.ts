#!/usr/bin/env -S pkgx deno run -A

import { hooks, utils } from "pkgx"
import { isString, isArray } from "is-what"

const rvv: Record<string, any>[] = []
for (const arg of Deno.args) {
  const pkg = utils.pkg.parse(arg)
  const config = await get_config(pkg)

  for (const platform of config.platforms) {
    const rv = {} as Record<string, any>
    rv['platform'] = get_matrix(platform)
    rv['pkg'] = arg
    rvv.push(rv)
  }
}

const ghout = Deno.env.get("GITHUB_OUTPUT")
if (ghout) {
  const json = JSON.stringify(rvv)
  Deno.writeTextFileSync(ghout, `matrix=${json}`, {append: true})
} else {
  const json = JSON.stringify(rvv, null, 2)
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

function get_matrix(platform: string) {
  const name = platform.replace('/', '+')
  switch (platform) {
    case 'darwin/aarch64': {
      const os = ["self-hosted", "macOS", "ARM64"]
      return {
        os, name,
        tinyname: "²"
      }}
    case 'darwin/x86-64': {
      const os = ["self-hosted", "macOS", "X64"]
      return {
        os, name,
        tinyname: "x64"
      }}
    case 'linux/x86-64': {
      const os = {group: "linux-x86-64"}
      return {
        os, name,
        container: "debian:buster-slim",
        tinyname: "*nix64"
      }}
    case 'linux/aarch64': {
      const os = ["self-hosted", "linux", "ARM64"]
      return {
        os, name,
        tinyname: "*nix·ARM64"
  }}}
}
