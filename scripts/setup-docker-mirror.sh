#!/usr/bin/env bash
# 在阿里云 ECS 上配置 Docker 镜像加速器（可选，项目 Dockerfile 已直连 DaoCloud）
set -euo pipefail

MIRROR_URL="${1:-}"

if [ -z "$MIRROR_URL" ]; then
  echo "用法: bash scripts/setup-docker-mirror.sh <你的阿里云加速器地址>"
  echo "示例: bash scripts/setup-docker-mirror.sh https://xxxxxx.mirror.aliyuncs.com"
  echo ""
  echo "获取地址: 阿里云控制台 → 容器镜像服务 ACR → 镜像工具 → 镜像加速器"
  exit 1
fi

sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": ["${MIRROR_URL}"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker

echo ">>> 已配置 Docker 镜像加速器"
docker info | grep -A 5 "Registry Mirrors" || true
