#!/usr/bin/env bash
# 低内存 ECS（1.6G）上构建 backend，避免 OOM 卡死
set -euo pipefail

cd "$(dirname "$0")/.."

export DOCKER_BUILDKIT=1
export COMPOSE_PARALLEL_LIMIT=1
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

echo ">>> 停止 backend（若在重启）..."
docker compose stop backend 2>/dev/null || true

echo ">>> 拉取最新代码..."
git pull origin main

echo ">>> 带缓存构建 backend（请勿使用 --no-cache）..."
echo ">>> npm install 阶段可能 5~10 分钟无输出，属正常"
docker compose build backend

echo ">>> 启动 backend..."
docker compose up -d backend

echo ">>> 日志（Ctrl+C 退出查看，不影响服务）..."
docker compose logs -f --tail=50 backend
