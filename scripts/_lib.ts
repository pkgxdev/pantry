import usePantry from "hooks/usePantry.ts"
import { PackageRequirement } from "types"

/// this function is poorly named and does too many things
/// sorry. Refactor is desired.

export function get_build_deps(dry: Set<string>) {
  const pantry = usePantry()

  return async (pkg: PackageRequirement) => {
    const deps = await pantry.getDeps(pkg)
    if (dry.has(pkg.project)) {
      // we hydrate the runtime deps of any build deps since if
      // any of `dry` is a runtime dep of any build dep (obv. from another)
      // pkg in the set we are building then it needs to be sorted first
      const rv = [...deps.runtime, ...deps.build]

      // if we are building a test-dep then we need it to be built before we
      // build `pkg` or we will not be able to test it before building the whole
      // graph
      for (const test_dep of deps.test) {
        if (dry.has(test_dep.project)) {
          rv.push(test_dep)
        }
      }

      return rv

    } else {
      return deps.runtime
    }
  }
}
