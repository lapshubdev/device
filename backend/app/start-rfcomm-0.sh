#!/bin/bash

attempt=0
max_attempts=$2
MAC=$1

while [[ $attempt -lt $max_attempts ]]; do
  echo "Attempt $((attempt+1)): Starting command..."
  /usr/bin/rfcomm connect 0 $MAC 1

  if [[ $? -eq 0 ]]; then
    echo "Command failed to start."
    attempt=$((attempt+1))
    sleep 1
  fi
done

echo "Maximum attempts reached. Exiting with an error."
exit 1
