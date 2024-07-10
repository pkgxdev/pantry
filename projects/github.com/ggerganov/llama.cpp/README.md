# getting started

```sh
$ pkgx +brewkit -- run llama-cli
# ^^ default chat prompt with an appropriate hugging face model
```

If you want to run `llama-cli` with your own args `pkgx llama-cli $ARGS` is
your friend.

# converting your own models

We provide a working `convert.py` from the llama.cpp project. To use it you
need to launch it via a tea pkgenv:

```sh
pkgx +llama-cli -- convert.py path/to/your/model
# ^^ the -- is necessary since `convert.py` is a not listed in the llama.cpp
# provides list
```
