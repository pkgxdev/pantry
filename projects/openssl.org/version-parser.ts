import { SemVer, semver } from "types"
import { panic } from "utils"

export default function parse(input: string): SemVer {
  if (input.startsWith('openssl-')) {
    return semver.coerce(input) ?? panic()
  } else {
    const [major, minor, patch, letter] = /OpenSSL_(\d+)_(\d+)_(\d+)(\w)/.exec(input)!
    const letter_number = letter.toLowerCase().charCodeAt(0) - 96
    const revised_patch = 100 * parseInt(patch) + letter_number
    if (Number.isNaN(revised_patch)) throw new Error()
    const v = `${major}.${minor}.${revised_patch}`
    return new SemVer(v)
  }
}
