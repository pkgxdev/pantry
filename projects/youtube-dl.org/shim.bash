#!/usr/bin/env bash
self="${BASH_SOURCE[0]}"
if test -L "$self"; then
  prefix="$(dirname "$self")"
  suffix="$(dirname $(readlink $self))"
  LIBEXEC="$(cd $prefix/$suffix && pwd)"
else
  LIBEXEC="$(cd "$(dirname "$self")" && pwd)"
fi
source "$LIBEXEC/activate"
exec "$LIBEXEC"/youtube-dl.py "$@"
