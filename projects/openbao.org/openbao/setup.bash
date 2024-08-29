#!/usr/bin/env -S pkgx +gnu.org/coreutils +bash^5 bash

function main {
  declare -r script_file_path="$( realpath "${BASH_SOURCE[0]}" )"
  declare -r package_bin_path="$( dirname "${script_file_path}" )"
  declare -r package_path="$( dirname "${package_bin_path}" )"
  declare -r package_etc_path="${package_path}/etc"
  declare -r system_etc_path='/etc'

  printf 'Package directory %s\n' ${package_path}

  install -v -D ${package_etc_path}/openbao/openbao.env ${system_etc_path}/openbao/openbao.env
  install -v -D ${package_etc_path}/openbao/openbao.hcl ${system_etc_path}/openbao/openbao.hcl
  install -v -D ${package_etc_path}/systemd/system/openbao.service ${system_etc_path}/systemd/system/openbao.service
}

main
