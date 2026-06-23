#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "已生成 .env，请编辑密码、JWT 密钥、WECHAT_SECRET 等后重新运行："
  echo "  bash scripts/deploy-prod.sh"
  exit 1
fi

echo ">>> 构建并启动服务..."
docker compose up -d --build

echo ""
echo "=========================================="
echo " 部署完成（HTTP 模式）"
echo "=========================================="
echo " 管理后台: http://plshow.cn/admin/"
echo " API:      http://plshow.cn/api/stations"
echo ""
echo " 下一步："
echo "  1. 确认 DNS 已将 plshow.cn / www.plshow.cn 解析到本机"
echo "  2. 申请 HTTPS: bash scripts/init-ssl.sh"
echo "  3. 首次初始化完成后，将 .env 中 RUN_SEED 改为 false"
echo "  4. 微信公众平台配置 request 合法域名: https://plshow.cn"
echo "=========================================="
