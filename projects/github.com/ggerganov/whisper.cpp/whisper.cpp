#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/models/whisper"

export PATH="$D/tbin:$PATH"

whisper-fetch "$MODEL_DIR" "$VERSION"

if test $1 = chat; then
  // TODO: prompt here is not chat, but speech?
  exec "$D"/tbin/whisper.cpp \
    --model "$MODEL_DIR"/7B/ggml-model-q4_0.bin \
    -n 256 \
    --repeat_penalty 1.0 \
    --color \
    -i \
    -r \
    "User:" \
    -f "$D"/share/prompts/chat-with-bob.txt
else
  exec "$D"/tbin/whisper.cpp \
    --color \
    --model "$MODEL_DIR"/7B/ggml-model-q4_0.bin \
    "$@"
fi
