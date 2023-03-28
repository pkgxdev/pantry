#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/models/alpaca-LoRA"

export PATH="$D/tbin:$PATH"

alpaca.cpp-fetch-model "$MODEL_DIR" "$VERSION"

if test "$1" != '--fetch'; then
  exec "$D"/tbin/alpaca.cpp \
    --color \
    --model "$MODEL_DIR"/ggml-alpaca-7b-q4.bin \
    "$@"
fi
