# fit & finish

* pkgs are installed to `~/.conda/pkgs`


# tips

* `conda` requires a shell hook to work, however this doesn’t have to be
  permanent you can call the following in a terminal instead:

  ```sh
  source <(conda shell.$(basename $SHELL) hook)
  ```

  > There is no provided way to unload these hooks


# prospects

* conda could be patched to use tea to install python and potentially other
  such kinds of dependencies
