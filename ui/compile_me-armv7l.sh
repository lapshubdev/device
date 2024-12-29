#!/bin/bash
./node_modules/.bin/ng build --base-href ./
./node_modules/.bin/electron-packager --overwrite . --platform linux --arch armv7l
