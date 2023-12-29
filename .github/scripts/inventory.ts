#!/usr/bin/env -S pkgx deno run --allow-net

const [project] = Deno.args

let versions: string[] = []

for (const platform of ["linux", "darwin"]) {
  for (const arch of ["x86-64", "aarch64"]) {
    const url = `https://dist.pkgx.dev/${project}/${platform}/${arch}/versions.txt`
    const txt = await (await fetch(url)).text()
    versions.push(...txt.split("\n"))
  }
}

versions = [...new Set(versions.filter(x => x.trim()))]

const ghout = Deno.env.get("GITHUB_OUTPUT")
if (ghout) {
  const json = JSON.stringify(versions)
  Deno.writeTextFileSync(ghout, `versions=${json}`, {append: true})
} else {
  console.log(JSON.stringify(versions))
}
