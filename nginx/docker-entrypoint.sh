#!/bin/sh
set -e

CERT="/etc/letsencrypt/live/plshow.cn/fullchain.pem"
rm -f /etc/nginx/conf.d/active-*.conf

if [ -f "$CERT" ]; then
  cp /etc/nginx/conf.d-templates/http-redirect.conf /etc/nginx/conf.d/active-http.conf
  cp /etc/nginx/conf.d-templates/https.conf /etc/nginx/conf.d/active-https.conf
  echo "[nginx] HTTPS enabled for plshow.cn"
else
  cp /etc/nginx/conf.d-templates/http.conf /etc/nginx/conf.d/active-http.conf
  echo "[nginx] HTTP-only mode (run scripts/init-ssl.sh after DNS is ready)"
fi

exec nginx -g 'daemon off;'
