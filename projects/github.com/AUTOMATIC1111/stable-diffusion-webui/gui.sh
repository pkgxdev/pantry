#!/bin/bash

set -emx

d="$(cd "$(dirname $0)"/.. && pwd)"

"$d"/bin/stable-diffusion-webui &

# poll into a HEAD request succeeds
while ! curl -Is http://127.0.0.1:7860 | grep -q "HTTP/1.1 200 OK"; do
  sleep 1
done

# open the URL once the HEAD request succeeds
open http://127.0.0.1:7860

# tell tea/gui about it
echo '{"viewer": "http://127.0.0.1:7860"}'

tea gum format <<EoMD
# Stable Diffusion WEBUI

this package has been modified for your convenience:

* Stable Diffusion models can be added to ~/.local/share/models/stable-diffusion
* extensions can be added to ~/.local/share/stable-diffusion-webui/extensions
* generated images are saved to ~/Documents/Stable Diffusion WEBUI
* configuration is saved to ~/.config/stable-diffusion-webui

> *NOTE* we obey \`XDG_\` variables for all the above if they are set

> bugs reports to our [tracker](https://github.com/teaxyz/pantry/issues). thanks!

enjoy!
EoMD

fg
