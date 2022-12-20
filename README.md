![tea](https://tea.xyz/banner.png)

This pantry† represents the most essential open source packages in the world.
We promise to prioritize fixes, updates and robustness for these packages.
We will not lightly accept additions, and thus suggest submitting your pull
request against [pantry.extra] first.

> † see [pantry.zero] for “what is a pantry”

# Use with tea/cli

tea/cli clones/updates this pantry and [pantry.extra] when installed with the
installer or when you run `tea --sync`. At this time pantries are not
versioned.

# Contributing

See the contributing guide in [pantry.zero].


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
for x in $(find scripts -name '*.ts'); do
  deno check --unstable --import-map=$SRCROOT/import-map.json $x
done
```

[pantry.zero]: https://github.com/teaxyz/pantry.zero#contributing
[pantry.extra]: https://github.com/teaxyz/pantry.extra
