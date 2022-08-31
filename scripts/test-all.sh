#!/bin/sh

set -eo pipefail

for x in $(scripts/ls.ts); do
  scripts/test.ts $x --magic
done
