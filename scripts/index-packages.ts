#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-env
  - --allow-net
  - --allow-sys
---*/

import { usePantry } from "hooks"
import * as ARGV from "./utils/args.ts"
import { SQSClient, SendMessageCommand } from "npm:@aws-sdk/client-sqs@^3"
import { panic } from "utils"

const sqsClient = new SQSClient({ region: Deno.env.get("AWS_REGION") ?? panic("No region specified") })
const pantry = usePantry()

const pkgs = await ARGV.toArray(ARGV.pkgs())
for(const pkg of pkgs) {
  try {
    const yml = await pantry.getYAML(pkg).parse()

    const project = pkg.project

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
