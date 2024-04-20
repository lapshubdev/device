#!/bin/bash
export PATH=$PATH:/usr/local/lib/node/node-v12.18.2-linux-armv7l/bin

npm install
./node_modules/.bin/ng build --base-href ./
#ng build --base-href ./
electron-builder --linux --armv7l

sudo systemctl stop trackidol-frontend
cp ./release/trackidol-logic-0.0.0-armv7l.AppImage ~/.bin/frontend/current/trackidol-logic-0.0.0-armv7l.AppImage
sudo systemctl start trackidol-frontend
