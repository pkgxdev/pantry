![tea](https://tea.xyz/banner.png)

# What is a Pantry?

Pantries provide consistent metadata about open source packages. This
metadata shouldn’t require manual collection, but at this current state in
open source it does.

It is collected and duplicated thousands of times. A huge waste of effort.

tea aims to eradicate this wasted effort, though unfortunately, the journey
there will require—to some extent—doing that duplication one more time.

## Doing it a Little Better This Time

Our format is YAML, which is at least non-proprietary and could be used by
other tools without an independent parser. And we’re pulling in data from
other sources as much as possible, eg. versions are taken from the
“source” whenever possible.

&nbsp;


# Contributing

Assuming you have tea (/w magic) installed:

```sh
$ git clone https://github.com/teaxyz/pantry

$ cd pantry
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

> * `pkg` can be run without magic via `tea -E pkg` (this dev-env provides `+tea.xyz/brewkit`).
> * `gh` can be run without magic via `tea gh`.
> * `git` can be run without magic via `tea git`.
> * `pkg build` and `pkg test` take a `-L` flag to run in a Linux Docker container
> * All commands take an optional pkg-spec eg. `pkg build zlib.net^1.1`

While inside a pantry dev-env you can run commands from any built packages
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
$ gh pr checkout https://github.com/teaxyz/pantry/pull/123

# then open for editing:
$ pkg edit
```


[wiki]: https://github.com/teaxyz/pantry/wiki
[discussion]: https://github.com/orgs/teaxyz/discussions
[IPFS]: https://ipfs.tech
