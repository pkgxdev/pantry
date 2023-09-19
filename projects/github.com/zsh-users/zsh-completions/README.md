To activate these completions, add the following to your .zshrc:

```
if type tea &>/dev/null; then
    FPATH=$ZSH_COMPLETIONS_ROOT/share/zsh-completions:$FPATH

    autoload -Uz compinit
    compinit
fi
```

You may also need to force rebuild `zcompdump`:

```
rm -f ~/.zcompdump; compinit
```

Additionally, if you receive "zsh compinit: insecure directories" warnings when attempting to load these completions, you may need to run these commands:

`chmod go-w "$ZSH_COMPLETIONS_ROOT/share"`
`chmod -R go-w "$ZSH_COMPLETIONS_ROOT/share/zsh"`