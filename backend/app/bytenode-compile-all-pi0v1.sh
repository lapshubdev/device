#!/bin/bash
#####
### This scripts compiles binaries for Pi0 W2
###
####

export PATH=$PATH:/usr/local/lib/node/node-v12.18.2-linux-armv6l/bin

rm -rf ./dist
mkdir dist

cat gps.js | sed -e 's/.\/libs.*\//\.\//g' > app.js
sleep 1

# make sure all modules are compiled and ready to roll
npm install

# compile all source files
bytenode -c app.js gpio.js ./libs/*.js ./libs/**/*.js

echo -e -n "Compiling."
mv app.jsc dist/
mv gpio.jsc dist/
mv ./libs/cloud/*.jsc dist/
mv ./libs/stopwatch/*.jsc dist/
mv ./libs/system/*.jsc dist/
mv ./libs/gps/*.jsc dist/
mv ./libs/math/*.jsc dist/
mv ./libs/obd/*.jsc dist/
mv ./libs/compress/*.jsc dist/
mv ./libs/socket/*.jsc dist/
mv ./libs/sensors/*.jsc dist/

cp -r ./node_modules dist/
cp -r start-be-gps-pi0v1.sh dist/start-be-gps.sh
cp -r s-s.sh dist/
cp -r firewall.sh dist/
cp -r get-updates-pi0v1.sh dist/get-updates.sh
cp -r start-rfcomm-0.sh dist/
cp -r wakeup.txt dist/
cp -rf version.txt dist/

rm -rf ./dist/node_modules/serial-obd
cp -rf ./libs/thirdparty/serial-obd ./dist/node_modules/serial-obd
rm app.js
tar -czvf rh-backend-pi0v1.tar.gz dist/

####
sudo systemctl stop trackidol-backend
rm -rf ~/.bin/backend/new
mkdir ~/.bin/backend/new
###

mkdir -p ~/.bin/release/backend
mkdir -p ~/.bin/release/frontend

##
cp -rf dist/* ~/.bin/backend/new/
cp get-updates-pi0v1.sh rh-backend-pi0v1.tar.gz ~/.bin/release/backend/
mv ~/.bin/release/backend/get-updates-pi0v1.sh ~/.bin/release/backend/get-updates.sh

sudo systemctl start trackidol-backend
