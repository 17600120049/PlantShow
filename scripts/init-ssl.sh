#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "缺少 .env，请先运行: bash scripts/deploy-prod.sh"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [ -z "${CERTBOT_EMAIL:-}" ]; then
  echo "请在 .env 中设置 CERTBOT_EMAIL"
  exit 1
fi

echo ">>> 检查 Nginx 是否运行..."
docker compose ps nginx | grep -q "Up" || {
  echo "请先启动服务: bash scripts/deploy-prod.sh"
  exit 1
}

echo ">>> 申请 Let's Encrypt 证书（plshow.cn + www.plshow.cn）..."
docker compose --profile certbot run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d plshow.cn -d www.plshow.cn \
  --email "$CERTBOT_EMAIL" \
  --agree-tos --no-eff-email

echo ">>> 重启 Nginx 启用 HTTPS..."
docker compose restart nginx

echo ">>> 启动证书自动续期..."
docker compose --profile certbot up -d certbot

echo ""
echo "=========================================="
echo " HTTPS 已启用"
echo "=========================================="
echo " 管理后台: https://plshow.cn/admin/"
echo " API:      https://plshow.cn/api/stations"
echo "=========================================="
