#!/bin/bash

set -e

ROOT=$(realpath "$(dirname "$BASH_SOURCE")/..")

docker build -t="typeorm/tree-issue" .
