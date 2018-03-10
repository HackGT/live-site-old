---
title: Raspberry Pi 3 Instructions
---
Got a Raspberry Pi 3?  Here are instructions on how to SSH into it without an ethernet cable:

1. Look for `hackgt-####` on the front of the box.  Make note of this - you'll need it later.
2. Plug in the Raspberry Pi 3.  Wait one minute, then connect to the network with the name you found on the Pi's box.  The network's password is `hackgtrpi`.
3. If you receive a prompt asking if you want your device to be discoverable on the network, choose **Yes**.
4. Wait 5 minutes before continuing.
5. Open a Bash shell. On Windows, you can use [Putty](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html) or [Bash on Ubuntu on Windows](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
6. If you're using Bash, run `ssh pi@192.168.42.1`.  For Putty, the `Host Name` is `pi@192.168.42.1`.  The password for the `pi` user on the Raspberry Pi is `raspberry`.
7. Happy Hacking!
