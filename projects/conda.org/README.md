# tips

* `conda` requires a shell hook to work, however this doesn’t have to be
  permanent you can call the following in a terminal instead:

  ```sh
  source <(conda shell.$(basename $SHELL) hook)
  ```

  They do not provide a way to unload these hooks however.

# mods

* conda has been configured to not write to its prefix


## potential mods

* conda could be patched to use tea to install python and potentially other
  such kinds of dependencies
