[Unit]
Description=SFTPGo Server
After=network.target

[Service]
Type=simple
User=_sftpgo
Group=_sftpgo
ExecStart=/usr/local/bin/pkgx +{{
  getenv "package_project" "SETUP_ERROR"
}}^{{
  getenv "package_version" "SETUP_ERROR"
}} sftpgo-wrapper {{
  getenv "app_homedir" "SETUP_ERROR"
}}
ExecReload=/bin/kill -s HUP $MAINPID
LimitNOFILE=8192
KillMode=mixed
PrivateTmp=true
Restart=always
RestartSec=10s
NoNewPrivileges=yes
PrivateDevices=yes
DevicePolicy=closed
ProtectSystem=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target

