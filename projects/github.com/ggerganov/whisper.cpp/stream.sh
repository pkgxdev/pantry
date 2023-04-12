#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR=""$D"/tbin/models"

export PATH="$D/tbin:$PATH"

whisper-fetch $MODEL_DIR $VERSION

if test $1 = example; then
  exec "$D"/tbin/stream \
    -m "$MODEL_DIR"/ggml-base.en.bin \
    -vth 0.6 \
    -t 8 \
    -f ./stream_example.txt \
    --step 500 \
    --length 5000
else
  exec "$D"/tbin/stream \
    --model "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
fi
