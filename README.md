![tea](https://tea.xyz/banner.png)

This pantry† represents the most essential open source packages in the world.
We promise to prioritize fixes, updates and robustness for these packages.
We will not lightly accept additions, and thus suggest submitting your pull
request against [pantry.extra] first.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

[tea/cli] clones/updates this pantry and [pantry.extra] when installed with
the installer or when you run `tea --sync`. At this time pantries are not
versioned.

&nbsp;


# Contributing

```sh
$ git clone https://github.com/teaxyz/pantry.core

$ cd pantry.core
# all the following commands operate in `./tea.out`
# your tea installation remains untouched

$ pkg init
# ^^ creates a “wip” package.yml

$ pkg edit
# ^^ opens the new package.yml in your EDITOR

$ pkg build
# ^^ will probably require a (zero permissions) GitHub [PAT].
# Using `gh auth login` is the easiest way to set this up.

$ pkg test
# ^^ you need to write a test that verifies the package works

$ gh repo fork
$ git branch -m my-new-package
$ git push origin my-new-package
$ gh pr create
```

## Packaging Guide

Packaging can be cumbersome.
Our [wiki] is our packaging knowledge base.
For other assistance, start a [discussion].

## After Your Contribution

We build “bottles” (tar’d binaries) and upload them to both our centralized
bottle storage and decentralized [IPFS].

tea automatically builds new releases of packages *as soon as they are
released* (usually starting the builds within seconds). There is no need to
submit PRs for updates.



[pantry.zero]: https://github.com/teaxyz/pantry.zero
[pantry.extra]: https://github.com/teaxyz/pantry.extra
[wiki]: https://github.com/teaxyz/pantry.zero/wiki
[tea/cli]: https://github.com/teaxyz/cli
[discussion]: https://github.com/orgs/teaxyz/discussions
[PAT]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[IPFS]: https://ipfs.tech
