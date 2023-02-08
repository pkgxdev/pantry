![tea](https://tea.xyz/banner.png)

This pantry† is the complement to [pantry.core].

Longer term it will be split out into more pantries, some of which we hope
will be maintained by their own communities.

> † see [pantry.zero] for “what is a pantry”


# Contributing

See the contributing guide in [pantry.zero][pantry.zero/contributing].

[pantry.zero]: https://github.com/teaxyz/pantry.zero
[pantry.zero/contributing]: https://github.com/teaxyz/pantry.zero#contributing
[pantry.core]: https://github.com/teaxyz/pantry.core

&nbsp;



# Tasks

The following can all be run with `xc`, eg. `xc init`.

## Init

Creates a new package at `./projects/wip/$RANDOM_TEA_BLEND/package.yml`.

```sh
tea -E +tea.xyz/brewkit init
```

## Edit

Opens all wip packages in `$EDITOR`.

```sh
tea -E +tea.xyz/brewkit edit
```

## Build

Builds all wip packages to `./tea.out`.

```sh
tea -E +tea.xyz/brewkit build
```

## Test

Tests all wip packages.

```sh
tea -E +tea.xyz/brewkit test
```


# Installing to `~/.tea`

You can move the contents of `tea.out` to `~/.tea` but this isn’t sufficient,
you also need the pantry entries.

So at this time we don’t have a *great* solution, but we’re working on it.
