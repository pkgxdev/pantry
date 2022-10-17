
const e = new TextEncoder()
const encode = e.encode.bind(e)

export function set_output<T>(name: string, arr: T[], separator = " ") {
  const value = arr.map(escape).join(separator)
  const txt = `::set-output name=${name}::${value}`
  return Deno.stdout.write(encode(`${txt}\n`))
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
