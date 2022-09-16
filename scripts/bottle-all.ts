#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-run
  - --allow-read
  - --allow-write={{ tea.prefix }}
  - --allow-env=GITHUB_TOKEN,TEA_PREFIX
  - --import-map={{ srcroot }}/import-map.json
---*/

import { bottle } from "./bottle.ts"
import { ls } from "./ls.ts"
import useCellar from "hooks/useCellar.ts"

const cellar = useCellar()

for await (const {project} of ls()) {
  for (const { path, pkg } of await cellar.ls(project)) {
    try {
      await bottle({ path, pkg })
    } catch (error) {
      console.error({ 'bottling-failure': pkg, error })
    }
  }
}
