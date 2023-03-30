(setq exec-path (delete nil
  (mapcar
    (lambda (elt)
      (unless (string-match-p ".tea" elt) elt))
    exec-path)))
