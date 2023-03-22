#!/bin/bash

cd /home/roomba
sudo -u roomba python server.py &
python -m http.server 80
