const e = new TextEncoder()
const encode = e.encode.bind(e)

export async function set_output<T>(name: string, arr: T[], separator = " ") {
  const value = arr.map(escape).join(separator)
  const txt = `${name}=${value}`
  const outfile = Deno.env.get("GITHUB_OUTPUT")
  if (outfile) {
    await Deno.writeTextFile(outfile, `${name}=${value}\n`, { append: true})
  }
  return await Deno.stdout.write(encode(`${txt}\n`))
}

//TODO HTML escapes probs
function escape<T>(input: T): string {
  const out = `${input}`
  if (/[<>~]/.test(out)) {
    return `"${out}"`
  } else {
    return out
  }
}
