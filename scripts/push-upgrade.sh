#!/usr/bin/env bash
# 本机（Mac/Linux）：推送 Gitee + SSH 远程一键升级
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DEPLOY_ENV="$ROOT/scripts/deploy.env"
if [ -f "$DEPLOY_ENV" ]; then
  # shellcheck disable=SC1090
  source "$DEPLOY_ENV"
fi

ECS_HOST="${ECS_HOST:-root@123.57.244.162}"
ECS_PATH="${ECS_PATH:-/root/PlantShow}"
UPGRADE_MODE="${UPGRADE_MODE:-backend}"

echo ">>> 推送到 Gitee..."
git push gitee main

if [ "$UPGRADE_MODE" = "none" ]; then
  echo ">>> UPGRADE_MODE=none，跳过远程升级"
  echo ">>> 请在 ECS 上手动执行: cd $ECS_PATH && bash scripts/upgrade-prod.sh"
  exit 0
fi

UPGRADE_FLAG=""
if [ "$UPGRADE_MODE" = "all" ]; then
  UPGRADE_FLAG="--all"
fi

echo ">>> 远程升级 $ECS_HOST ($UPGRADE_MODE)..."
ssh "$ECS_HOST" "cd '$ECS_PATH' && bash scripts/upgrade-prod.sh $UPGRADE_FLAG --auto"

echo ""
echo ">>> 本机推送 + 远程升级完成"
