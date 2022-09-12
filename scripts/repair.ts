#!/usr/bin/env -S tea -E

/*
---
args:
  - deno
  - run
  - --allow-net
  - --allow-env=TEA_PREFIX,VERBOSE,DEBUG,MAGIC,GITHUB_ACTIONS,JSON
  - --allow-read={{ tea.prefix }}
  - --allow-write={{ tea.prefix }}
  - --allow-run  # uses `/bin/ln`
  - --import-map={{ srcroot }}/import-map.json
---
*/

import repairLinks from "prefab/repair-links.ts"
import useFlags from "hooks/useFlags.ts"

useFlags()

for (const project of Deno.args) {
  await repairLinks(project)
}
