#!/usr/bin/env bash
# ECS 上加载本机构建好的镜像并启动（不在服务器上 build）
set -euo pipefail

cd "$(dirname "$0")/.."

TAR="${1:-/root/plantshow-images.tar}"

if [ ! -f "$TAR" ]; then
  echo "找不到镜像包: $TAR"
  echo "用法: bash scripts/load-images-server.sh [/root/plantshow-images.tar]"
  exit 1
fi

echo ">>> 加载镜像..."
docker load -i "$TAR"

echo ">>> 确认镜像..."
docker images | grep -E "plantshow|REPOSITORY" || true

if [ ! -f .env ]; then
  echo "缺少 .env，请先: cp .env.example .env && nano .env"
  exit 1
fi

echo ">>> 启动服务（不构建）..."
docker compose up -d

echo ""
echo ">>> 状态:"
docker compose ps

echo ""
echo ">>> backend 日志（最近 30 行）:"
docker compose logs backend --tail=30

echo ""
echo "成功标志: plant-show-backend 为 Up (healthy)"
echo "访问: http://你的公网IP/admin/"
