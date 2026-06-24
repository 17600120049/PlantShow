#!/usr/bin/env bash
# 兼容旧命令，转调 upgrade-prod.sh
exec "$(dirname "$0")/upgrade-prod.sh" "$@"
