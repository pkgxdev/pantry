#!/usr/bin/env tea

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-net
---*/

import { usePantry } from "hooks"
import { panic } from "utils"
import * as semver from "semver"

const url = Deno.env.get("WATCHER_URL") ?? panic("missing $WATCHER_URL")
const token = Deno.env.get("TEA_API_TOKEN") ?? panic("missing $TEA_API_TOKEN")

const pantry = usePantry()

const rv: Set<{project: string, github: string}> = new Set()

for await (const {project} of pantry.ls()) {
  const yml = await pantry.getYAML({project, constraint: new semver.Range('*') }).parse()
  if (yml?.versions?.github) {
    const github = yml.versions.github.split('/').slice(0, 2).join('/')
    rv.add({ project, github })
  }
}

const options = {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`,
  },
  body: JSON.stringify([...rv]),
}

console.log(rv)
await fetch(url, options)