#!/usr/bin/env -S pkgx bash
# shellcheck shell=bash

d=$(dirname "$0")

mkdir -p ./etc/gnupg

cat << EOF > ./etc/gnupg/gpg.conf
use-agent
pinentry-mode loopback
agent-program $d/bin/gpg-agent
EOF