#!/bin/bash
ng build --base-href ./
#./node_modules/.bin/electron-packager --overwrite .
electron-builder build
