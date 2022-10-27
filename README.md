![tea](https://tea.xyz/banner.png)

tea is a decentralized package manager—this requires a decentralized package
registry. We’re releasing our testnet later this year. In the meantime the
pantry is our stop-gap solution.

# Getting Started

You’ll need a `GITHUB_TOKEN` in your environment since we use the GitHub
GraphQL API to fetch versions.

&nbsp;


# Meta

## Entry Requirements

This pantry only accepts devtools that we feel confident we can maintain.
Quality and robustness are our goals. If you want other tools you can maintain
your own pantry and we’ll build the binaries.

## Philosophy

Fundamentally we're coming at this from the perspective that the maintainer
should decide how their software is distributed and we’re making the tools so
they can do that in cross platform way.

This repo is a bootstrap and is stubs.

## Naming

We use fully-qualified names. Naming is hard, and the world has spent a while
trying to get it right. In this kind of domain the *correct choice* is
to namespace.

## Packaging Knowledgebase

Our [wiki](/wiki) is our knowledgebase. Fill it with the fruits of your
knowledge. Please keep it tidy.

&nbsp;


# Coming Soon

## Maintaining Your Own Pantry

We will build binaries for forks of this repository and then surface the
`package.yml`s you maintain to users of tea/cli. This feature is coming
soon and will require signed commits and that you come to our Discord and say
hi.

## Hosting and Maintaining Your Own `package.yml`

If you have a website you can host your own `package.yml` there and we will
build binaries for you. This feature is coming soon and will require
signed, versioned tags and signed source tarballs.


&nbsp;

# Dependencies

|   Project   | Version |
|-------------|---------|
| deno.land   | ^1.23   |
| tea.xyz     | ^0      |

## Build All

```sh
scripts/ls.ts | xargs scripts/sort.ts | xargs scripts/build.ts
```

## Typecheck

```sh
for x in scripts/*.ts src/app.ts; do
  deno check --unstable --import-map=$SRCROOT/import-map.json $x
done
```
