#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-net
  - --allow-sys
  - --import-map={{ srcroot }}/import-map.json
---*/

import * as semver from "semver"
import { usePantry } from "hooks"
import * as ARGV from "./utils/args.ts"
import  { SQSClient, SendMessageCommand } from "npm:@aws-sdk/client-sqs"

const sqsClient = new SQSClient({ region: 'us-east-1' })
const pantry = usePantry()

const pkgs = await ARGV.toArray(ARGV.pkgs())
for(const { project } of pkgs) {
  try {
    const yml = await pantry.getYAML({ project, constraint: new semver.Range('*') }).parse()

    const taskMessage = {
      project,
      github: yml?.versions?.github || "",
      // TODO: add other useable data here eventually
    }
    const res = await sqsClient.send(new SendMessageCommand({
      MessageGroupId: 'project',
      MessageDeduplicationId: project,
      MessageBody: JSON.stringify(taskMessage),
      QueueUrl: Deno.env.get("SQS_GENERATE_PACKAGE_DETAILS_URL")!,
    }))
    console.log(`SQS task for pkg:${project} messageId:${res.MessageId}`)
  } catch (error) {
    console.error(error);
  }
}
