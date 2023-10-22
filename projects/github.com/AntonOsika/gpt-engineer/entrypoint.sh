#!/usr/bin/env -S tea bash
# shellcheck shell=bash

#---
# dependencies:
#   charm.sh/gum: '*'
#---

set -eo pipefail

# attempt to get the key from the user’s shell rc files (if set)
if [ -z "$OPENAI_API_KEY" ] && [ -n "$SHELL" ]; then
  # shellcheck disable=SC2155,2016
  export OPENAI_API_KEY="$(env -i "$SHELL" -ic 'echo $OPENAI_API_KEY')"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  gum format <<EoMD
    # OpenAI API key required
    You need an OpenAI API key to use this package.

    > https://platform.openai.com/account/api-keys

    GPT4 is recommended (but you gotta sign up for the
    the [waitlist](https://openai.com/waitlist/gpt-4-api))

    **this key will not be persisted by pkgx!**
EoMD

  echo  # spacer

  # shellcheck disable=SC2155
  export OPENAI_API_KEY="$(gum input --placeholder 'key pls')"
fi

gum format <<EoMD
  # what do you want to build?

  the example prompt \`gpt-engineer\` provide is:

  > we are writing snake in python. MVC components split in separate files. keyboard control.

  type your prompt below (⌃D when done)
EoMD

echo #spacer

prompt="$(gum write --placeholder 'main prompt…')"

gum format <<EoMD
  # we store the results in your documents folder, what’s the title?
EoMD

title="$(gum input --placeholder 'title?')"

docs="${XDG_DOCUMENTS_DIR:-$HOME/Documents}/GPT Engineer"

mkdir -p "$docs/$title"
echo "$prompt" > "$docs/$title/main_prompt"

gum format <<EoMD
  > output will be written to \`$docs/$title\`

  # running \`gpt-engineer\`
EoMD

exec gpt-engineer "$docs/$title"
