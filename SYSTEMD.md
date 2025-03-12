Create user:  
`useradd -m -s /bin/bash username`

Create example service, like node app:  
`nano ~/.config/systemd/user/cisco.service`

containing:

```
[Unit]
Description=Cisco IP Phone 7942G Services

[Service]
ExecStart=/usr/bin/node /home/username/cisco-services/index.js

[Install]
WantedBy=default.target
```

From root run: `loginctl enable-linger username`

and from user add: `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$UID/bus`  
to `/home/username/.bashrc` or `/home/username/.zshrc`

Then user can run: `systemctl --user enable cisco.service`

enable/disable/start/stop/status