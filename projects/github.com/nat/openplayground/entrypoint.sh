#!/bin/bash

set -ex

source <(tea --magic=bash)

PORT=$(nc -zv localhost 5432-9000)

"$d"/bin/openplayground run --port $PORT &

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

fg
