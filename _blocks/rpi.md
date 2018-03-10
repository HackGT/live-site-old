---
title: Raspberry Pi 3 Instructions
---
Got a Raspberry Pi 3?  Here are instructions on how to SSH into it without an ethernet cable:

1. Look for `hackgt-####` on the front of the box.  Make note of this - you'll need it later.
2. Plug in the Raspberry Pi 3.  Wait for a minute, then connect to the network with that SSID.  The password is `hackgtrpi`.
3. If you receive a prompt asking if you want your device to be discoverable on the network, choose **Yes**.
4. Wait 5 minutes before continuing.
5. Open bash. On Windows, you can use `putty` or Bash on Ubuntu on Windows.
6. Run `ssh pi@192.168.42.1`.  The password is `raspberry`.
7. Happy Hacking!
