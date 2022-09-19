# build all

```sh
scripts/ls.ts | xargs scripts/sort.ts | xargs scripts/build.ts
```

# test all

`each.ts` reduces output for each input to a concise ✅ or ❌ based on exit
status.

```sh
scripts/ls.ts | xargs scripts/each.ts scripts/test.ts
```
