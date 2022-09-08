#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{ tea.prefix }}
  - --allow-env=GITHUB_TOKEN
  - --import-map={{ srcroot }}/import-map.json
---*/

import { bottle } from "./bottle.ts"
import { ls } from "./ls.ts"
import useCellar from "hooks/useCellar.ts"

const cellar = useCellar()

for await (const {path} of ls()) {
  const pkg = (await cellar.resolve(path)).pkg
  try {
    await bottle({ path, pkg })
  } catch (error) {
    console.verbose({ 'bottling-failure': pkg, error })
  }
}
