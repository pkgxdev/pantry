(setq exec-path (delete nil
  (mapcar
    (lambda (elt)
      (unless (string-match-p "Homebrew/shims" elt) elt))
    exec-path)))