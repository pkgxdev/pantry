#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR=""$D"/tbin/models"

export PATH="$D/tbin:$PATH"

whisper-fetch $MODEL_DIR $VERSION

case $1 in
stream)
  shift
  exec "$D"/tbin/stream \
    --model "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
  ;;
command)
  shift
  exec "$D"/tbin/command \
    --model "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
  ;;
*)
  exec "$D"/tbin/main \
    --model "$MODEL_DIR"/ggml-base.en.bin \
    "$@"
  ;;
esac
