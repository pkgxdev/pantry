#!/usr/bin/env -S pkgx deno run --allow-read

import { hooks } from "pkgx"

const project = Deno.args[0]

const yml = await hooks.usePantry().project(project).yaml()
const qaRequired = yml?.["test"]?.["qa-required"] === true
Deno.exit(qaRequired ? 0 : 1)
