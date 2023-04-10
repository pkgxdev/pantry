#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

D="$(cd "$(dirname "$0")"/.. && pwd)"
VERSION="$(basename "$D")"
MODEL_DIR="$./models"

export PATH="$D/tbin:$PATH"

// llama-fetch "$MODEL_DIR" "$VERSION"

echo $1 
echo $D 
echo $MODEL_DIR 

if test $1 = chat; then
  exec "$D"/tbin/whisper.cpp \
    --m "$MODEL_DIR"/base.en.bin \
    --print-colors \
    -f "$D"/share/jfk.wav
else
  exec "$D"/tbin/whisper.cpp \
    --print-colors \
    --model "$MODEL_DIR"/base.en.bin \
    "$@"
fi
