#!/usr/bin/env zx

let name = YAML.parse('foo: bar').foo
console.log(`name is ${name}`)
await $`touch ${name}`