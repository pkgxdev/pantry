![pkgx](https://pkgx.dev/banner.png)

pkg metadata and build instructions.

# Contributing

Assuming you have `pkgx` with shell integration:

```sh
$ git clone https://github.com/pkgxdev/pantry

$ cd pantry

$ dev  # https://docs.pkgx.sh/dev
# ^^ IMPORTANT! Otherwise the `pkg` command cannot be found

$ pkg init
# ^^ creates a “wip” package.yml
# ^^ if you already know the name, you can pass it as an argument

$ pkg edit
# ^^ opens the new package.yml in your EDITOR

$ pkg build
# builds to `./builds`
# ^^ needs a zero permissions GITHUB_TOKEN to use the GitHub API
# either set `GITHUB_TOKEN` or run `gh auth login`

$ foo
# ^^ anything in the `provides:` key will now run

$ pkg test
# ^^ you need to write a test that verifies the package works

$ gh repo fork
$ git branch -m my-new-package
$ git push origin my-new-package
$ gh pr create
```

> * `pkg build` and `pkg test` take a `-L` flag to run in a Linux Docker container
> * All commands take an optional pkg-spec eg. `pkg build zlib.net^1.1`

While inside the pantry `dev` environment you can run commands from any built
packages provided you specified their `provides:` key.

## BrewKit

We use a special package called [`brewkit`] to build packages both here and
in CI/CD. `brewkit` provides the `pkg` command.

## GitHub Codespaces

`pantry` also works in GitHub Codespaces. The default configuration
provides with the repository will install/update `pkgx` at the time
you attach, so you should be able to quickly work on or test packages
in a remote linux environment (or work from a device with just a web browser).

## Packaging Guide

Packaging can be cumbersome.
Our [wiki] is our packaging knowledge base.
For other assistance, start a [discussion].

The best way to figure out solutions for your problems is to read other
examples from the pantry.

## After Your Contribution

We build “bottles” (tar’d binaries) and upload them to our CDN. Thus your
contribution will be available at merge-time + build-time. `pkgx` should
automatically sync the pantry to your local machine if you ask for something
it doesn’t know about, but in the case where that fails do a `pkgx --sync`
first.

The pantry automatically builds new releases of packages *as soon as they are
released* (usually starting the builds within seconds). There is no need to
submit PRs for updates.

## Working on Other People’s Pull Requests

Packaging can be fiddly so we all pitch in. If you want to help someone else
with their pull request then you can use GitHub’s CLI:

```
$ gh pr checkout 123

# or you can copy paste the URL:
$ gh pr checkout https://github.com/pkgxdev/pantry/pull/123

# then open for editing:
$ pkg edit
```


[wiki]: https://github.com/pkgxdev/pantry/wiki
[discussion]: https://github.com/orgs/pkgxdev/discussions
[IPFS]: https://ipfs.tech
[`npmjs.com/provider.yml`]: ./projects/npmjs.com/provider.yml
