import usePantry from "hooks/usePantry.ts"
import { PackageRequirement } from "types"

export function get_build_deps(dry: Set<string>) {
  const pantry = usePantry()

  return async (pkg: PackageRequirement) => {
    const deps = await pantry.getDeps(pkg)
    if (dry.has(pkg.project)) {
      // we hydrate the runtime deps of any build deps since if
      // any of `dry` is a runtime dep of any build dep (obv. from another)
      // pkg in the set we are building then it needs to be sorted first
      return [...deps.runtime, ...deps.build]
    } else {
      return deps.runtime
    }
  }
}
