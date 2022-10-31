![tea](https://tea.xyz/banner.png)

tea is a decentralized package manager—this requires a decentralized package
registry. Our pantries are our tentative first step towards that goal.

# pantry.extra

This pantry is our “at launch” complement to [pantry.core].

For now, new pantry submissions should go here.

[pantry.core]: ../../../pantry.core

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