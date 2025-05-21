#!/usr/bin/env -S pkgx +gnu.org/coreutils +bash^5 bash

function main {
  local -r script_file_path="$( realpath "${BASH_SOURCE[0]}" )"
  local -r package_bin_path="$( dirname "${script_file_path}" )"
  local -r package_path="$( dirname "${package_bin_path}" )"
  local -r package_etc_path="${package_path}/etc"
  local -r system_etc_path='/etc'
  local -r environment_file='glauth.env'
  local -r config_file='glauth.toml'
  local -r service_systemd_file='glauth.service'

  printf 'Package directory %s\n' ${package_path}

  install -v -D "${package_etc_path}/glauth/${environment_file}" "${system_etc_path}/glauth/${environment_file}"
  install -v -D "${package_etc_path}/glauth/${config_file}" "${system_etc_path}/glauth/${config_file}"
  install -v -D "${package_etc_path}/systemd/system/${service_systemd_file}" "${system_etc_path}/systemd/system/${service_systemd_file}"
}

main
