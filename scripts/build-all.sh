#!/bin/bash

set -eo pipefail

d="$(cd "$(dirname "$0")" && pwd)"
all=$($d/ls.ts | xargs $d/sort.ts)

for x in $all
do
  $d/build.ts $x
  $d/test.ts $x --magic  #FIXME be precise
done

# $d/bottle.ts $all
