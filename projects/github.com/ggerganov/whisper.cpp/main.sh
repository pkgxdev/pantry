#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR=""$D"/tbin/models"

export PATH="$D/tbin:$PATH"

whisper-fetch $MODEL_DIR $VERSION

if test $1 = example; then
  exec "$D"/tbin/main \
    -m "$MODEL_DIR"/ggml-base.en.bin \
    --print-colors \
    -f "$D"/share/jfk.wav
else
  exec "$D"/tbin/main \
    --print-colors \
    --model "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
fi
