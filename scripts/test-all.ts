#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-run
  - --allow-read
  - --allow-env
  - --import-map={{ srcroot }}/import-map.json
---*/

import { Path } from "types"
import { ls } from "./ls.ts"

const cwd = new Path(new URL(import.meta.url).pathname).parent().string

for await (const { project } of ls()) {
  const proc = Deno.run({
    stdout: "null", stderr: "null",
    cmd: ["./test.ts", project],
    cwd
  })
  const status = await proc.status()
  if (status.code !== 0) {
    console.error(`test failed: ${project}`)
  }
}
