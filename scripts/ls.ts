#!/usr/bin/env -S tea -E

// returns all pantry entries as `[{ name, path }]`

/*---
args:
  - deno
  - run
  - --allow-env
  - --allow-read=/opt/tea.xyz/var/pantry
  - --import-map={{ srcroot }}/import-map.json
---*/

import { Path } from "types"
import useFlags from "hooks/useFlags.ts"

const flags = useFlags()


const prefix = new Path('/opt/tea.xyz/var/pantry/projects')

//FIXME unfortunately importing executes the script below
export async function* ls(): AsyncGenerator<Entry> {
  for await (const path of _ls_pantry(prefix)) {
    yield {
      name: path.parent().relative({ to: prefix }),
      path: path.string
    }
  }
}

async function* _ls_pantry(dir: Path): AsyncGenerator<Path> {
  if (!dir.isDirectory()) throw new Error()

  for await (const [path, { name, isDirectory }] of dir.ls()) {
    if (isDirectory) {
      for await (const x of _ls_pantry(path)) {
        yield x
      }
    } else if (name === "package.yml") {
      yield path
    }
  }
}

interface Entry {
  name: string
  path: string
}

const rv: Entry[] = []
for await (const item of ls()) {
  rv.push(item)
}

if (Deno.env.get("GITHUB_ACTIONS")) {
  const projects = rv.map(x => x.name).join(":")
  console.log(`::set-output name=projects::${projects}`)
} else if (flags.json) {
  const output = JSON.stringify(rv, null, 2)
  console.log(output)
} else {
  console.log(rv.map(x => x.name).join("\n"))
}
