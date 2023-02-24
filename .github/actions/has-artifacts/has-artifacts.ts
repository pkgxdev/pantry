#!/usr/bin/env tea

/*---
args:
  - deno
  - run
  - --allow-net
  - --allow-env
---*/

/// Test
/// ./scripts/has-artifacts.ts e582b03fe6efedde80f9569403555f4513dbec91

import { S3 } from "s3"
import { panic } from "utils"
import { find_pr } from "../fetch-pr-artifacts/fetch-pr-artifacts.ts"

/// Main
/// -------------------------------------------------------------------------------

if (import.meta.main) {
  const usage = "usage: has-artifacts.ts {REPO} {SHA}"
  const repo = Deno.args[0] ?? panic(usage)
  const ref = Deno.args[1] ?? panic(usage)

  const pr = await find_pr(repo, ref)

  if (!pr) {
    Deno.stdout.write(new TextEncoder().encode("has-artifacts=false"))
    Deno.exit(0)
  }

  const s3 = new S3({
    accessKeyID: Deno.env.get("AWS_ACCESS_KEY_ID")!,
    secretKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
    region: "us-east-1",
  })
  const bucket = s3.getBucket(Deno.env.get("AWS_S3_CACHE")!)

  const objects = await bucket.listObjects({ prefix: `pull-request/${repo.split("/")[1]}/${pr}/` })

  const hasArtifacts = (objects?.contents?.length || 0) > 0

  Deno.stdout.write(new TextEncoder().encode(`has-artifacts=${hasArtifacts ? "true" : "false"}`))
}
