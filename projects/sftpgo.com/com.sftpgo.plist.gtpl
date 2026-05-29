<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.sftpgo.com</string>
    <key>UserName</key>
    <string>_sftpgo</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/pkgx</string>
        <string>+{{ getenv "package_project" "SETUP_ERROR" }}^{{ getenv "package_version" "SETUP_ERROR" }}</string>
        <string>sftpgo</string>
        <string>serve</string>
        <string>--config-dir</string>
        <string>{{ getenv "app_conf_path" "SETUP_ERROR" }}</string>
    </array>
    <key>KeepAlive</key>
    <true/>
    <key>ThrottleInterval</key>
    <integer>10</integer>
</dict>
</plist>
