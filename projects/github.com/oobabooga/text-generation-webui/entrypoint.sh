#!/usr/bin/env -S tea bash

PORT=$(tea get-port)

set -emfo pipefail

tea gum format <<EoMD
# loading llama.cpp model…

this may take a while…

EoMD

echo  # spacer

tea llama.cpp --fetch

d="$(cd "$(dirname $0)" && pwd)"

XDG="${XDG_DATA_HOME:-$HOME/.local/share}"

"$d"/bin/text-generation-webui \
  --listen-port $PORT \
  --model-dir "$XDG/models" \
  --model OpenLLaMA \
  &

PID=$!

# poll until a HEAD request succeeds
while ! curl -Is http://127.0.0.1:$PORT | grep -q "HTTP/1.1 200 OK"; do
  if ! kill -0 $PID; then
    echo "webui process died!"
    exit 1
  fi
  sleep 1
done

# open the URL once the HEAD request succeeds
if test -n "$TEA_GUI"; then
  echo "{\"xyz.tea\":{\"gui\":\"http://127.0.0.1:$PORT\"}}" >&2
else
  open "http://127.0.0.1:$PORT"
fi

tea gum format <<EoMD
# text generation web UI

this package has been modified for your convenience:

* download additional models to \`$XDG/models\`

> bugs reports to our [tracker](https://github.com/teaxyz/pantry/issues). thanks!

enjoy!
EoMD

echo  # spacer

fg  >/dev/null # unbackground the webui process
