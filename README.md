# Requires package
```git python```

# First-time system configuration
- Create a user named `roomba`.
- Make this user a passwordless sudoer by editing `/etc/sudoers` to have `roomba ALL=(ALL) NOPASSWD: ALL`. Add it after the line `#includedir /etc/sudoers.d` for it to take effect.
- Clone the repo and move all contents to `/home/roomba/` (or just transfer it via whatever methods, skip git requirement)
- Modify system-wide crontab `/home/roomba/start.sh` as user `roomba` every reboot, i.e. (`@reboot roomba bash -c '/home/roomba/start.sh'`)
- Missing wifi network configuration steps goes here

# TODO
There was some steps to configure the wifi chip to make its own public hotspot and broadcast it but the knowledge is currently lost.
Also need to find the python version and pin it for reproducibility.
