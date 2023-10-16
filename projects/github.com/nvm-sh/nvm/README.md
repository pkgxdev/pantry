### Configuring NVM on Linux and Darwin

#### For Linux

Insert the following lines into your `~/.profile` file:

```bash
[ -s "$NVM_DIR/libexec/nvm.sh" ] && \. "$NVM_DIR/libexec/nvm.sh"  # Loads nvm
[ -s "$NVM_DIR/etc/bash_completion.d/nvm" ] && \. "$NVM_DIR/etc/bash_completion.d/nvm"  # Loads nvm bash_completion
```

Execute `source ~/.profile` to apply the changes or simply restart your terminal.

#### For Darwin (macOS)

Insert the following lines into your `~/.zshrc` file:

```bash
[ -s "$NVM_DIR/libexec/nvm.sh" ] && \. "$NVM_DIR/libexec/nvm.sh"  # Loads nvm
[ -s "$NVM_DIR/etc/bash_completion.d/nvm" ] && \. "$NVM_DIR/etc/bash_completion.d/nvm"  # Loads nvm bash_completion
```

Execute `source ~/.zshrc` to apply the changes or simply restart your terminal.

Now you can use nvm in your terminal to manage Node.js versions.