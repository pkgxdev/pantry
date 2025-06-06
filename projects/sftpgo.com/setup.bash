#!/usr/bin/env -S pkgx +gnu.org/coreutils +gomplate.ca +bash^5 bash

function install_files {
#  declare -r package_bin_path="$(
#    sudo -u _sftpgo pkgx +${package_project}^${package_version} \
#  | cut -d= -f2 \
#  | cut -d$ -f1 \
#  | tr -d \" 
#  )"
  declare -r package_path="$( dirname "${package_bin_path}" )"
  declare -r package_conf_path="${package_path}/conf"

  command install -v -D -b \
          "${package_conf_path}/${app_conf_file}" \
          "${app_conf_path}/${app_conf_file}"
  command gomplate --verbose \
          --file "${package_conf_path}/${app_environment_file}.gtpl" \
          --out "${app_conf_path}/${app_environment_file}"
  command gomplate --verbose \
          --file "${package_conf_path}/${service_file}.gtpl" \
          --out  "${services_path}/${service_file}"

  for subdir in templates openapi static; do
    ln -v -s "${package_conf_path}/${subdir}" \
             "${app_conf_path}"
  done
}

function setup_on_linux {
  declare -rx app_homedir="/home/${app_username}"
  declare -rx app_conf_path="${app_homedir}/app/sftpgo/conf"
  declare -r  service_file='sftpgo.service'
  declare -r  services_path='/etc/systemd/system'

  if [[ -d /run/systemd/system ]]; then
    useradd -m \
            -d "${app_homedir}" \
            "${app_username}"

    install_files
  else
    echo 'Only systemd supported yet on Linux'
  fi
}

function setup_on_darwin {
  declare -rx app_homedir="/Users/${app_username}"
  declare -rx app_conf_path="${app_homedir}/app/sftpgo/conf"
  declare -r  service_file='com.sftpgo.plist'
  declare -r  services_path='/Library/LaunchDaemons'

  sysadminctl -addUser \
              -home "${app_homedir}" \
              "${app_username}"

  install_files
}

function main {
  declare -r  script_file_path="$( realpath "${BASH_SOURCE[0]}" )"
  declare -r  package_bin_path="$( dirname "${script_file_path}" )"
  declare -r  package_path="$( dirname "${package_bin_path}" )"
  declare -rx package_project='sftpgo.com'
  declare -rx package_version="${package_path#*/v}"

  declare -r  app_username="_sftpgo"
  declare -r  app_environment_file='sftpgo.env'
  declare -r  app_conf_file='sftpgo.json'

  printf 'Package directory %s\n' ${package_path}

  case "$(uname)" in
    Linux)
      setup_on_linux
      ;;
    Darwin)
      setup_on_darwin
     ;;
    *)
      echo 'OS not supported'
      ;;
  esac
  
}

main
