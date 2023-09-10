#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/models/OpenLLaMA"

"$D"/libexec/llama-fetch "$MODEL_DIR" "$VERSION"

if [ "$1" = '--fetch' ]; then
  exit
fi

if [ $# -eq 0 ]; then
  exec "$D"/libexec/llama.cpp \
    --model "$MODEL_DIR/OpenLLaMA-3Bv2.ggml.f16.bin" \
    --ctx-size 512 \
    --batch-size 1024 \
    --n-predict 256 \
    --keep 48 \
    --repeat_penalty 1.0 \
    --color \
    --interactive \
    --reverse-prompt "User:" \
    --file "$D"/share/prompts/chat-with-bob.txt
fi

# detect --model arg or not
for arg in "$@"; do
  if [ "$arg" = "--model" -o  "$arg" = "-m" ]; then
    exec "$D"/libexec/llama.cpp "$@"
  fi
done

exec "$D"/libexec/llama.cpp "$@" --model "$MODEL_DIR/OpenLLaMA-3Bv2.ggml.f16.bin"
