#!/usr/bin/env -S pkgx bash
# shellcheck shell=bash

PORT=$(pkgx npx --yes get-port-cli)

set -emfo pipefail

pkgx gum format <<EoMD
# loading llama.cpp model…

this may take a while…

EoMD

echo  # spacer

pkgx llama.cpp --fetch

d="$(cd "$(dirname "$0")" && pwd)"

XDG="${XDG_DATA_HOME:-$HOME/.local/share}"

"$d"/bin/text-generation-webui \
  --listen-port "$PORT" \
  --model-dir "$XDG/models" \
  --model OpenLLaMA \
  &

PID=$!

# poll until a HEAD request succeeds
while ! curl -Is http://127.0.0.1:"$PORT" | grep -q "HTTP/1.1 200 OK"; do
  if ! kill -0 $PID; then
    echo "webui process died!"
    exit 1
  fi
  sleep 1
done

# open the URL once the HEAD request succeeds
# shellcheck disable=SC2154
if test -n "$pkgx_GUI"; then
  echo "{\"xyz.pkgx\":{\"gui\":\"http://127.0.0.1:$PORT\"}}" >&2
else
  open "http://127.0.0.1:$PORT"
fi

pkgx gum format <<EoMD
# text generation web UI

this package has been modified for your convenience:

* download additional models to \`$XDG/models\`

> bugs reports to our [tracker](https://github.com/pkgxxyz/pantry/issues). thanks!

enjoy!
EoMD

echo  # spacer

fg  >/dev/null # unbackground the webui process
