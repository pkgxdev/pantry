![pkgx](https://pkgx.dev/banner.png)

pkgx metadata and build instructions.

# Contributing

You need [`pkgx`]. We recommend using [`dev`] to get [`brewkit`] which we use
to build packages:

```sh
$ git clone https://github.com/pkgxdev/pantry

$ cd pantry

$ dev  # https://docs.pkgx.sh/dev
# ^^ adds brewkit (ie. the `bk` command) to your devenv
# ^^ IMPORTANT! Otherwise the `bk` command will not be found
# ^^ Alternatively, you can use pkgx and prefix your commands with the ENV
# ^^ PKGX_PANTRY_PATH=$(pwd) pkgx bk [command] (PKGX_PANTRY_DIR for pkgx^2)

$ bk init
# ^^ creates a “wip” package.yml
# ^^ if you already know the name, you can pass it as an argument

$ bk edit
# ^^ opens the new package.yml in your EDITOR

$ bk build
# builds to `./builds`
# ^^ needs a zero permissions GITHUB_TOKEN to use the GitHub API
# either set `GITHUB_TOKEN` or run `gh auth login`

$ pkgx yq .provides <projects/$(bk status | tr -d '[:space:]')/package.yml
- bin/foo
# ^^ purely demonstrative for the next step

$ pkgx foo
# ^^ anything in the `provides:` key will now run

$ bk audit
# ^^ worth doing an audit to check for common pkging issues

$ bk test
# ^^ you need to write a test that verifies the package works

$ gh repo fork
$ git branch -m my-new-package
$ git push origin my-new-package
$ gh pr create
```

> [!NOTE]
> If you don’t want to use [`dev`] you can prefix [`pkgx`] in front of all
> `bk` commands or [`pkgm i bk`] to install [`brewkit`] to `/usr/local`.

> [!TIP]
> * `bk build` and `bk test` can be invoked eg. `bk docker build` to run
>   inside a Docker container for Linux builds and testing
> * All commands take an optional pkg-spec eg. `bk build node@19`
> * While inside the pantry `dev` environment you can run commands from any
>   built packages provided you specified their `provides:` key in the
>   `package.yml`.

> [!NOTE]
> We use a special package called [`brewkit`] to build packages both here and
> in CI/CD. `brewkit` provides the `bk` command.

> [!IMPORTANT]
> brewkit installs the built products to `${PKGX_DIR:-$HOME/.pkgx}` which
> means they are installed to your unix-user’s pkgx cache.

## GitHub Codespaces

`pantry` also works in GitHub Codespaces. The default configuration
provided with the repository will install/update `pkgx` at the time
you attach, so you should be able to quickly work on test packages
in a remote linux environment (or work from a device with just a web browser).

## Packaging Guide

Packaging can be cumbersome.
Our [wiki] is our packaging knowledge base.
For other assistance, start a [discussion].

The best way to figure out solutions for your problems is to read other
examples from the pantry.

# After Your Contribution

We build “bottles” (tar’d binaries) and upload them to our CDN. Thus your
contribution will be available at merge-time + build-time + CDN distribution
time.

`pkgx` should
automatically sync the pantry to your local machine if you ask for something
it doesn’t know about, but in the case where that fails do a `pkgx --sync`
first.

> [!NOTE]
> The pantry automatically builds new releases of packages *as soon as they
> are released* (usually starting the builds within seconds). There is no need
> to submit PRs for updates.

Note that while in the pantry `dev` environment you can use your new package
if you built it. However this will not work outside the pantry `dev` unless
you either:
 
1. You set `PKGX_PANTRY_PATH` (`PKGX_PANTRY_DIR` for pkgx^2)
2. Get your PR merged!

# Working on Other People’s Pull Requests

Packaging can be fiddly so we all pitch in. If you want to help someone else
with their pull request then you can use GitHub’s CLI:

```sh
$ gh pr checkout 123

# or you can copy paste the URL:
$ gh pr checkout https://github.com/pkgxdev/pantry/pull/123

# then open for editing:
$ bk edit
```


[wiki]: https://github.com/pkgxdev/pantry/wiki
[discussion]: https://github.com/orgs/pkgxdev/discussions
[IPFS]: https://ipfs.tech
[`npmjs.com/provider.yml`]: ./projects/npmjs.com/provider.yml
[`brewkit`]: https://github.com/pkgxdev/brewkit
[`pkgm i bk`]: https://github.com/pkgxdev/pkgm
[`dev`]: https://github.com/pkgxdev/dev
[`pkgx`]: https://github.com/pkgxdev/pkgx
