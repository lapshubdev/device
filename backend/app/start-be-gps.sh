#!/bin/bash

export GPSDRIVER="./be-1"
export HOMEPATH="/home/fd27845fce8446287de9506c4650c71"
export CPATH="/home/fd27845fce8446287de9506c4650c71/.bin/config"
export PATH=$PATH:/usr/local/lib/node/node-v12.18.2-linux-armv7l/bin

sudo ${HOMEPATH}/.bin/backend/current/firewall.sh
cd ${HOMEPATH}/.bin/backend/current

minicom -D /dev/serial0 -b 9600 -S wakeup.txt -C output.txt &2>/dev/null &
sleep 2
killall minicom 2> /dev/null
sleep 1
echo -e -n "\xB5\x62\x06\x00\x14\x00\x01\x00\x00\x00\xD0\x08\x00\x00\x00\xC2\x01\x00\x07\x00\x03\x00\x00\x00\x00\x00\xC0\x7E" > /dev/serial0
sleep 1
echo -e -n "\xB5\x62\x06\x00\x14\x00\x01\x00\x00\x00\xD0\x08\x00\x00\x00\xC2\x01\x00\x07\x00\x03\x00\x00\x00\x00\x00\xC0\x7E" > /dev/serial0
sleep 1
echo -e -n "\xB5\x62\x06\x00\x14\x00\x01\x00\x00\x00\xD0\x08\x00\x00\x00\xC2\x01\x00\x07\x00\x03\x00\x00\x00\x00\x00\xC0\x7E" > /dev/serial0
sleep 1
echo -e -n "\xB5\x62\x06\x00\x14\x00\x01\x00\x00\x00\xD0\x08\x00\x00\x00\xC2\x01\x00\x07\x00\x03\x00\x00\x00\x00\x00\xC0\x7E" > /dev/serial0
sleep 1
#stty -F /dev/serial0 115200

/usr/local/lib/node/node-v12.18.2-linux-armv7l/bin/bytenode ./app.jsc
