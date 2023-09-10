# getting started

```sh
$ llama.cpp
# ^^ default chat prompt with the OpenLLaMA model
```

If you want to run `llama.cpp` with your own args specify them and chat mode
will be skipped.

If you want to use a different model specify `--model`.

# converting your own models

We provide a working `convert.py` from the llama.cpp project. To use it you
need to launch it via a tea pkgenv:

```sh
tea +github.com/ggerganov/llama.cpp convert.py path/to/your/model
```
