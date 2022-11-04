![tea](https://tea.xyz/banner.png)

This pantry† represents the most essential open source packages in the world.
We promise to prioritize fixes, updates and robustness for these packages.
We will not lightly accept additions, and thus suggest submitting your pull
request against [pantry.extra] first.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

tea/cli clones/updates this pantry and [pantry.extra] when installed with the
installer or when you run `tea --sync`.

At this time pantries are not versioned.

# Contributing

Firstly, clone this repository, you’ll edit files here. *Don’t work out of
`~/.tea/tea.xyz/var/pantry`, it’s not a git directory!*

You also must (currently, we know it sucks) clone tea/cli to the same *parent*
directory. So you’ll have:

```sh
$ ls
cli
pantry.core
```

Keep tea/cli updated, currently there is unversioned revlock between the two.
Also you should update your installed tea/cli frequently!)†

> † `sh <(curl tea.xyz)` updates the installed tea/cli

> Note that packages are split across multiple pantries, so to see the
> `package.yml` files for all your dependencies you may want to open another
> editor at `~/.tea/tea.xyz/var/pantry`

Create new `package.yml` files namespaced as per our current patterns under
the [`./projects/`] folder. The `package.yml` format is not documented
(sorry!), but it is not complex, pick an existing entry for tips.

You should verify that your package builds before submitting it.

```sh
export GITHUB_TOKEN=…   # you need a (zero permissions) [PAT]
./scripts/build.ts pkg.com
# ^^ you will need to have installed all dependencies *manually* first
# try `scripts/deps.ts -b pkg.com | xargs ../cli/scripts/install.ts`
```

Packages require a `test` YAML node. This script should thoroughly verify all
the functionality of the package is working. You can run the test with:

```sh
./scripts/test.ts pkg.com
```

tea requires all packages be relocatable. Our CI will verify this for you.
You can check locally by moving the installation from `~/.tea` to another tea
installation (eg. `~/.tea.build`‡ and running the test again.

Now make a pull request! We’ll test on all platforms we support in the PR. If
it passes both CI and review: we’ll merge!

> ‡ `TEA_PREFIX=~/.tea.build sh <(curl tea.xyz)`

## Packaging Guide

Our [wiki] is our packaging knowledge base.
For other assistance, start a [discussion].

## After Your Contribution

We build “bottles” (tar’d binaries) and upload them to both our centralized
bottle storage and decentralized [IPFS].

tea automatically builds new releases of packages *as soon as they are
released* (usually starting the builds within seconds). There is no need to
submit PRs for updates.

&nbsp;


# Meta
## Dependencies

|   Project   | Version |
|-------------|---------|
| deno.land   | ^1.27   |
| tea.xyz     | ^0      |

## Build All

```sh
scripts/ls.ts | scripts/sort.ts | scripts/build.ts
```

## Typecheck

```sh
for x in scripts/*.ts src/app.ts; do
  deno check --unstable --import-map=$SRCROOT/import-map.json $x
done
```

[pantry.zero]: ../../../pantry.zero
[pantry.extra]: ../../../pantry.extra
[`./projects/`]: ./projects
[IPFS]: https://ipfs.tech
[PAT]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[wiki]: ../../../pantry.zero/wiki
[discussion]: https://github.com/orgs/teaxyz/discussions
