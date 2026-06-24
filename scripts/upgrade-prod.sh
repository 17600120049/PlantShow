#!/usr/bin/env bash
# ECS 一键升级：拉 Gitee 代码 → 按需构建 → 重启 → 健康检查
set -euo pipefail

cd "$(dirname "$0")/.."

BUILD_BACKEND=true
BUILD_NGINX=false
NO_BUILD=false
AUTO=false

usage() {
  cat <<'EOF'
用法: bash scripts/upgrade-prod.sh [选项]

选项:
  (默认)          拉代码 + 构建 backend + 重启
  --all           同时构建 backend 和 nginx（改了管理后台/nginx 时用）
  --no-build      只拉代码并 docker compose up -d（未改代码仅重启）
  --auto          根据 git 变更自动决定是否构建 nginx
  -h, --help      显示帮助

示例:
  bash scripts/upgrade-prod.sh
  bash scripts/upgrade-prod.sh --all
  bash scripts/upgrade-prod.sh --auto
  bash scripts/upgrade-prod.sh --no-build
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all) BUILD_BACKEND=true; BUILD_NGINX=true; AUTO=false; shift ;;
    --backend-only) BUILD_BACKEND=true; BUILD_NGINX=false; AUTO=false; shift ;;
    --no-build) NO_BUILD=true; shift ;;
    --auto) AUTO=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知选项: $1"; usage; exit 1 ;;
  esac
done

if [ ! -f .env ]; then
  echo "缺少 .env，请先: cp .env.example .env && nano .env"
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_PARALLEL_LIMIT=1
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"

PREV_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")

echo ">>> 拉取最新代码..."
git pull origin main

NEW_HEAD=$(git rev-parse HEAD)

if [ "$PREV_HEAD" = "$NEW_HEAD" ] && [ "$NO_BUILD" = false ] && [ "$AUTO" = false ]; then
  echo ">>> 代码已是最新，仍将重建 backend（带缓存）..."
fi

if [ "$AUTO" = true ] && [ "$PREV_HEAD" != "$NEW_HEAD" ]; then
  CHANGED=$(git diff --name-only "$PREV_HEAD" "$NEW_HEAD" || true)
  if echo "$CHANGED" | grep -qE '^(admin-frontend/|nginx/)'; then
    BUILD_NGINX=true
    echo ">>> 检测到 admin/nginx 变更，将一并构建 nginx"
  fi
  if echo "$CHANGED" | grep -qE '^(backend/|docker-compose\.yml)'; then
    BUILD_BACKEND=true
  fi
  if [ -z "$CHANGED" ]; then
    NO_BUILD=true
  fi
fi

if [ "$NO_BUILD" = true ]; then
  echo ">>> 跳过构建，重启服务..."
  docker compose up -d
else
  if [ "$BUILD_BACKEND" = true ]; then
    echo ">>> 构建 backend（带缓存，npm 阶段可能数分钟无输出）..."
    docker compose build backend
    docker compose up -d backend
    echo ">>> 等待 backend 就绪..."
    for _ in $(seq 1 40); do
      if docker compose ps backend 2>/dev/null | grep -qE 'Up.*healthy'; then
        echo ">>> backend 已 healthy"
        break
      fi
      sleep 3
    done
  fi

  if [ "$BUILD_NGINX" = true ]; then
    echo ">>> 构建 nginx..."
    docker compose build nginx
  fi

  docker compose up -d
fi

echo ""
echo ">>> 服务状态:"
docker compose ps

echo ""
if curl -sf http://localhost/api/stations >/dev/null 2>&1; then
  echo "✅ API 正常"
else
  echo "⚠️  API 暂不可用，请查看: docker compose logs backend --tail=50"
fi

DOMAIN=$(grep -E '^DOMAIN=' .env 2>/dev/null | cut -d= -f2- | tr -d '\r' || true)
DOMAIN=${DOMAIN:-plshow.cn}

echo ""
echo "=========================================="
echo " 升级完成"
echo " 管理后台: http://${DOMAIN}/admin/"
echo " API:      http://${DOMAIN}/api/stations"
echo "=========================================="
