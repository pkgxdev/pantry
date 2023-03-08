![tea](https://tea.xyz/banner.png)

This pantry† is the complement to [pantry.core].

Longer term it will be split out into more pantries, some of which we hope
will be maintained by their own communities.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

[tea/cli] clones/updates this pantry and [pantry.core] when installed with
the installer or when you run `tea --sync`. At this time pantries are not
versioned.

&nbsp;


# Contributing

Assuming you have tea+magic installed:

```sh
$ git clone https://github.com/teaxyz/pantry.extra

$ cd pantry.extra
# all the following commands operate in `./tea.out`
# your tea installation remains untouched

$ pkg init
# ^^ creates a “wip” package.yml
# ^^ if you already know the name, you can pass it as an argument

$ pkg edit
# ^^ opens the new package.yml in your EDITOR

$ pkg build
# ^^ needs a zero permissions GITHUB_TOKEN to use the GitHub API
# either set `GITHUB_TOKEN` or run `gh auth login`

$ pkg test
# ^^ you need to write a test that verifies the package works

$ gh repo fork
$ git branch -m my-new-package
$ git push origin my-new-package
$ gh pr create
```

> `pkg` can be run without magic via `tea -E pkg` (this dev-env provides `+tea.xyz/brewkit`).  
> `gh` can be run without magic via `tea gh`.  
> `git` can be run without magic via `tea git`.

While in a pantry dev-env you can run commands from any built packages
provided you specified their `provides:` key.

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

## Working on Other People’s Pull Requests

Packaging can be fiddly so we all pitch in. If you want to help someone else
with their pull request then you can use GitHub’s CLI:

```
$ gh pr checkout 123

# or you can copy paste the URL:
$ gh pr checkout https://github.com/teaxyz/pantry.extra/pull/123

# then open for editing:
$ pkg edit
```

&nbsp;


# Dependencies

| Project         | Version |
|-----------------|---------|
| tea.xyz/brewkit | ^0.3    |


[pantry.zero]: https://github.com/teaxyz/pantry.zero
[pantry.core]: https://github.com/teaxyz/pantry.core
[wiki]: https://github.com/teaxyz/pantry.zero/wiki
[tea/cli]: https://github.com/teaxyz/cli
[discussion]: https://github.com/orgs/teaxyz/discussions
[PAT]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
[IPFS]: https://ipfs.tech
