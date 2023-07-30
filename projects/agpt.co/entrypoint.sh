#!/usr/bin/env -S tea bash

#---
# dependencies:
#   charm.sh/gum: '*'
#---

set -eo pipefail

# attempt to get the key from the user’s shell rc files (if set)
if [ -z "$OPENAI_API_KEY" -a -n "$SHELL" ]; then
  export OPENAI_API_KEY="$(env -i "$SHELL" -ic 'echo $OPENAI_API_KEY')"
fi

if [ -z "$OPENAI_API_KEY" ]; then
  gum format <<EoMD
    # OpenAI API key

    Auto-GPT requires an OpenAI API.

    > https://platform.openai.com/account/api-keys

    GPT4 is recommended (but you gotta sign up for the
    the [waitlist](https://openai.com/waitlist/gpt-4-api))

    **this key will not be persisted by tea!**
EoMD

  echo  # spacer

  export OPENAI_API_KEY="$(gum input --placeholder 'key pls')"
fi

gum format <<EoMD
  # gpt version?

  which gpt version does your OpenAI API key support?

  > sadly this must be specified explicitly, so we gotta ask
EoMD

echo  #spacer

GPT="$(gum choose {GPT3,GPT4})"

docs="${XDG_DOCUMENTS_DIR:-$HOME/Documents}/Auto-GPT"

gum format <<EoMD
  # fyi

  * output goes here: \`$docs\`

  # exe

  running **Auto-GPT**…
EoMD

if test "$GPT" = GPT3
then
  exec auto-gpt --gpt3only
else
  exec auto-gpt
fi
