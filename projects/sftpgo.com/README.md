# Service Setup - Linux

We provide a custom script, `sftpgo-setup`, to create a simplified global install
for those wishing to run `sftpgo` using systemd on Linux.

At its base, it does the following:

- Creates `/etc/sftpgo`.
- Copies in `sftpgo.env` and `sftpgo.json` from our prefix.
- Installs a `systemd` service file in `/etc/systemd/system/sftpgo.service`

If desired, it can be undone by doing:

`sudo rm /etc/sftpgo/sftpgo.{env,json} /etc/systemd/system/sftpgo.service`
