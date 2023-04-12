#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR=""$D"/tbin/models"

export PATH="$D/tbin:$PATH"

whisper-fetch $MODEL_DIR $VERSION


if test $1 = example; then
  exec "$D"/tbin/command \
    -m "$MODEL_DIR"/ggml-base.en.bin \
    -cmd "$D"/share/commands.txt
else
  exec "$D"/tbin/command \
    -m "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
fi
