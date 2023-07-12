#!/bin/bash

set -emfo pipefail

tea gum format <<EoMD
# loading…

> *NOTE* this may take a few minutes the first time it runs

EoMD

echo  # spacer

d="$(cd "$(dirname $0)" && pwd)"

"$d"/bin/stable-diffusion-webui &

PID=$!

# poll until a HEAD request succeeds
while ! curl -Is http://127.0.0.1:7860 | grep -q "HTTP/1.1 200 OK"; do
  if ! kill -0 $PID; then
    echo "webui process died!"
    exit 1
  fi
  sleep 1
done

# open the URL once the HEAD request succeeds
if test -n "$TEA_GUI"; then
  echo '{"xyz.tea":{"gui":"http://127.0.0.1:7860"}}' >&2
else
  open "http://127.0.0.1:7860"
fi

tea gum format <<EoMD
# Stable Diffusion WEBUI

this package has been modified for your convenience:

* download additional Stable Diffusion models to \`~/.local/share/models/stable-diffusion\`
* extensions can be added to \`~/.local/share/stable-diffusion-webui/extensions\`
* generated images are saved to \`~/Documents/Stable Diffusion WEBUI\`
* configuration is saved to \`~/.config/stable-diffusion-webui\`

> *NOTE* we obey \`XDG_\` variables for all the above if they are set

> bugs reports to our [tracker](https://github.com/teaxyz/pantry/issues). thanks!

enjoy!
EoMD

echo  # spacer

fg  # unbackground the webui process
