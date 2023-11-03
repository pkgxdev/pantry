# Running OpenCanary via pkgx

## Configuring OpenCanary

When OpenCanary starts it looks for config files in the following locations and will stop when the first configuration is found:

1. `./opencanary.conf` (i.e. the directory where OpenCanary is installed)
2. `~/.opencanary.conf` (i.e. the home directory of the user, usually this will be `root` so `/root/.opencanary.conf`)
3. `/etc/opencanaryd/opencanary.conf`

To create an initial configuration, run as `root` (you may be prompted for a `sudo` password):
```
$ pkgx opencanaryd --copyconfig
[*] A sample config file is ready /etc/opencanaryd/opencanary.conf

[*] Edit your configuration, then launch with "pkgx opencanaryd --start"
```

This creates the path and file `/etc/opencanaryd/opencanary.conf`. You must now edit the config file to determine which services and logging options you want to enable.

# Launching OpenCanary

Start OpenCanary by running the following as root (or with `sudo -E`):

```
$ pkgx opencanaryd --start
```
