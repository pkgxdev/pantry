#!/usr/bin/env -S pkgx +bash^5 bash

set -x
set -u

function main {
  declare -r app_homedir="${1}"

  source "${app_homedir}/app/sftpgo/conf/sftpgo.env"

  pkgx +${PKGX_SFTPGO_PROJECT}^${PKGX_SFTPGO_VERSION} \
       sftpgo serve

}

main ${@}
