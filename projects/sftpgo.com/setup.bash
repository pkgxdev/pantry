#!/usr/bin/env -S pkgx +gnu.org/coreutils +bash^5 bash

function main {
  declare -r script_file_path="$( realpath "${BASH_SOURCE[0]}" )"
  declare -r package_bin_path="$( dirname "${script_file_path}" )"
  declare -r package_path="$( dirname "${package_bin_path}" )"
  declare -r package_version="${package_path#*/v}"
  declare -r package_etc_path="${package_path}/etc"
  declare -r system_etc_path='/etc'

  declare -r environment_file='sftpgo/sftpgo.env'
  declare -r config_file='sftpgo/sftpgo.json'
  declare -r systemd_service_file='systemd/system/sftpgo.service'

  printf 'Package directory %s\n' ${package_path}

  case "$(uname)" in
    Linux)
      if [[ -d /run/systemd/system ]]; then
        install -v -D "${package_etc_path}/${environment_file}" \
                      "${system_etc_path}/${environment_file}"
        sed -i "s/^PKGX_SFTPGO_VERSION=.*$/PKGX_SFTPGO_VERSION=${package_version}/" \
                      "${system_etc_path}/${environment_file}"
        install -v -D "${package_etc_path}/${config_file}" \
                      "${system_etc_path}/${config_file}"
        install -v -D "${package_etc_path}/${systemd_service_file}" \
                      "${system_etc_path}/${systemd_service_file}"
      fi
      ;;
    Darwin)
      echo 'Not managed yet on darwin'
      ;;
    *)
      echo 'OS not supported'
      ;;
  esac
  
}

main
