#!/usr/bin/env bash

cd $(dirname $0)/..

rm -rf test-dir
mkdir test-dir

cp -r $(ls -A | grep -v test-dir) ./test-dir

cd ./test-dir

yarn
