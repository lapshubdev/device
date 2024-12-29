#!/bin/bash
export PATH=$PATH:/usr/local/lib/node/node-v12.18.2-linux-armv7l/bin
EXPECTED_MD5=$1

mkdir -p ~/.bin/release
mkdir -p ~/.bin/release/backend
mkdir -p ~/.bin/release/frontend

scp -P9412 -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no rhero@sftp.racetrackhero.com:~/rh-backend.tar.gz ~/.bin/release/backend

RESULT=$?

if [ $RESULT -eq 0 ]; then
  NEW_MD5=`md5sum ~/.bin/release/backend/rh-backend.tar.gz | cut -d " " -f1`

  echo "DOWNLOADED: $NEW_MD5 - EXPECTED CLOUD: $EXPECTED_MD5"
  echo "[SOFTWARE UPDATES SCRIPT - Downloaded]"
  if [ $NEW_MD5 == $EXPECTED_MD5 ]; then
    echo "SUCCESS"
    cd ~/.bin/release/backend
    tar -xvf rh-backend.tar.gz
    rm -rf ~/.bin/backend/old
    mv ~/.bin/backend/new ~/.bin/backend/old
    mkdir ~/.bin/backend/new
    mv dist/* ~/.bin/backend/new/
    rm -rf rh-backend.tar.gz

    sudo systemctl restart trackidol-backend
  else
    echo "[SOFTWARE UPDATES SCRIPT - VERSION MISMATCH, not updating]"
  fi

else
  echo "[SOFTWARE UPDATES SCRIPT - COUD NOT DOWNLOAD THE FILE]"
fi
