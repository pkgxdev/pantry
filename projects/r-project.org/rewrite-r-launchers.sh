#!/bin/sh
set -eu

prefix=$1

rewrite_r() {
  launcher=$1
  test -f "$launcher" || return 0

  awk '
    NR == 4 && /^R_HOME_DIR=/ {
      print "script_dir=`dirname \"$0\"`"
      print "case \"${script_dir}\" in"
      print "  */lib/R/bin) R_HOME_DIR=`cd \"${script_dir}/..\" && pwd -P` ;;"
      print "  *)"
      print "    prefix_dir=`cd \"${script_dir}/..\" && pwd -P`"
      print "    if test -x \"${prefix_dir}/lib64/R/bin/exec/R\"; then"
      print "      R_HOME_DIR=\"${prefix_dir}/lib64/R\""
      print "    else"
      print "      R_HOME_DIR=\"${prefix_dir}/lib/R\""
      print "    fi"
      print "    ;;"
      print "esac"
      print ""
      skip = 1
      next
    }
    skip && /^if test -n "\$\{R_HOME\}"/ {
      skip = 0
    }
    skip {
      next
    }
    /^R_SHARE_DIR=/ {
      print "R_SHARE_DIR=\"${R_HOME_DIR}/share\""
      next
    }
    /^R_INCLUDE_DIR=/ {
      print "R_INCLUDE_DIR=\"${R_HOME_DIR}/include\""
      next
    }
    /^R_DOC_DIR=/ {
      print "R_DOC_DIR=\"${R_HOME_DIR}/doc\""
      next
    }
    { print }
  ' "$launcher" >"${launcher}.tmp"
  mv "${launcher}.tmp" "$launcher"
  chmod +x "$launcher"
}

rewrite_rscript() {
  launcher=$1
  test -f "$launcher" || return 0

  bindir=`dirname "$launcher"`
  payload="${bindir}/Rscript.bin"
  test -f "$payload" || mv "$launcher" "$payload"

  cat >"$launcher" <<'EOF'
#!/bin/sh
script_dir=`dirname "$0"`
case "${script_dir}" in
  */lib/R/bin)
    RHOME=`cd "${script_dir}/.." && pwd -P`
    rscript="${script_dir}/Rscript.bin"
    ;;
  *)
    prefix_dir=`cd "${script_dir}/.." && pwd -P`
    if test -x "${prefix_dir}/lib64/R/bin/exec/R"; then
      RHOME="${prefix_dir}/lib64/R"
    else
      RHOME="${prefix_dir}/lib/R"
    fi
    rscript="${RHOME}/bin/Rscript.bin"
    ;;
esac
export RHOME
exec "${rscript}" "$@"
EOF
  chmod +x "$launcher"
}

rewrite_r "${prefix}/bin/R"
rewrite_r "${prefix}/lib/R/bin/R"
rewrite_rscript "${prefix}/lib/R/bin/Rscript"
rewrite_rscript "${prefix}/bin/Rscript"
