#!/usr/bin/env -S pkgx +gum +aria2c bash

set -eo pipefail
test -n "$VERBOSE" && set -x

MODEL_URL="https://huggingface.co/TheBloke/dolphin-2.1-mistral-7B-GGUF/resolve/main/dolphin-2.1-mistral-7b.Q4_K_M.gguf"
MODEL_FILENAME=$(basename "$MODEL_URL")
MODEL_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"/llama-cli

if [ ! -f "$MODEL_DIR/$MODEL_FILENAME" ]; then
  gum format <<EoMD
  # downloading $MODEL_FILENAME
  models will be placed: \`$PWD\`
  > this may take a a few minutes…
EoMD
  echo #spacer
  mkdir -p "$MODEL_DIR"
  aria2c "$MODEL_URL" --dir="$MODEL_DIR" --out="$MODEL_FILENAME"
  gum format "# All done!"
  echo #spacer
fi

D="$(cd "$(dirname "$0")" && pwd)"

if [ $# -gt 0 ]; then
  exec "$D"/bin/llama-cli \
    --model "$MODEL_DIR/$MODEL_FILENAME" \
    "$@"
else
  exec "$D"/bin/llama-cli \
      --model "$MODEL_DIR/$MODEL_FILENAME" \
      -n 256 \
      --repeat_penalty 1.0 \
      --color \
      --interactive \
      --reverse-prompt "User:" \
      --file "$D"/share/prompts/chat-with-bob.txt
fi
