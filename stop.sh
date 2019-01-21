#!/bin/bash

set -e

ROOT=$(realpath "$(dirname "$BASH_SOURCE")/..")

docker-compose down