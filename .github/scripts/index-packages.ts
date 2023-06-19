#!/usr/bin/env -S tea -E

/*---
args:
  - deno
  - run
  - --allow-read
  - --allow-net
  - --allow-env
  - --allow-sys
dependencies:
  deno.land: =1.34.2
---*/

import { SQSClient, SendMessageCommand } from "npm:@aws-sdk/client-sqs@^3"
import { SNSClient, PublishCommand } from "npm:@aws-sdk/client-sns@^3"
import * as ARGV from "./utils/args.ts"
import { hooks, utils } from "tea"
const { usePantry } = hooks

const region = Deno.env.get("AWS_REGION") ?? utils.panic("No region specified")
const sqsClient = new SQSClient({ region })
const snsClient = new SNSClient({ region })

const pantry = usePantry()

const pkgs = await ARGV.toArray(ARGV.pkgs())
for(const pkg of pkgs) {
  try {
    const yml = await pantry.project(pkg).yaml()

    const project = pkg.project

    const taskMessage = {
      project,
      github: yml?.versions?.github || "",
      // TODO: add other useable data here eventually
    }

    // DEPRECATED: This is the old way of doing things
    const res = await sqsClient.send(new SendMessageCommand({
      MessageGroupId: 'project',
      MessageDeduplicationId: project,
      MessageBody: JSON.stringify(taskMessage),
      QueueUrl: Deno.env.get("SQS_GENERATE_PACKAGE_DETAILS_URL")!,
    }))
    console.log(`SQS task for pkg:${project} messageId:${res.MessageId}`)

    const snsMessage = await snsClient.send(new PublishCommand({
      TopicArn: Deno.env.get("SNS_NEW_PACKAGES_TOPIC")!,
      Message: JSON.stringify(taskMessage),
      MessageGroupId: 'project',
      MessageDeduplicationId: project,
    }))

    console.log(`SNS message published for pkg:${project} messageId:${snsMessage.MessageId}`)
  } catch (error) {
    console.error(error);
  }
}
