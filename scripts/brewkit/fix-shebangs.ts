#!/usr/bin/env -S tea -E

/* ---
args:
  - deno
  - run
  - --allow-run
  - --allow-env
  - --allow-read
  - --allow-write={{tea.prefix}}
  - --import-map={{ srcroot }}/import-map.json
--- */

import Path from "path"
import { undent } from "utils"
import { useFlags } from "hooks"

useFlags()

const has_shebang = (() => {
  const encoder = new TextDecoder()
  return (buf: Uint8Array) => {
    return encoder.decode(buf) == '#!'
  }
})()

for (const path of Deno.args) {
  if (!Path.cwd().join(path).isFile()) continue

  console.debug({ path })

  const rid = await Deno.open(path, { read: true })
  try {
    const buf = new Uint8Array(2)
    await rid.read(buf)
    if (!has_shebang(buf)) continue
  } finally {
    rid.close()
  }

  //FIXME this could be pretty damn efficient if we can find the time
  //NOTE as it stands this is HIDEOUSLY inefficient

  const contents = await Deno.readFile(path)
  const txt = new TextDecoder().decode(contents)
  const [line0, ...lines] = txt.split("\n") //lol

  const match = line0.match(/^#!\s*(\/[^\s]+)/)
  if (!match) throw new Error()
  const interpreter = match[1]

  switch (interpreter) {
  case "/usr/bin/env":
  case "/bin/sh":
    console.verbose({ line0, path })
    console.verbose("^^ skipped acceptable shebang")
    continue
  }

  const shebang = `#!/usr/bin/env ${new Path(interpreter).basename()}`

  const rewrite = undent`
    ${shebang}
    ${lines.join("\n")}
    `

  console.verbose({rewrote: path, to: `#!/usr/bin/env ${interpreter}`})

  await Deno.writeFile(path, new TextEncoder().encode(rewrite))
}
