# fit & finish

* pkgs are installed to `~/.conda/pkgs`
* `conda init` is called during pkging so that `conda` will work without
  forcing you to install its shell hooks.

  > obv. you still need these shell hooks for `conda`’s environment system to
  > work, see the [#tips](#tips) section.


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
