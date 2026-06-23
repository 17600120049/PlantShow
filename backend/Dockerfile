# 国内服务器：DaoCloud 基础镜像 + npmmirror npm + Prisma 二进制镜像
FROM docker.m.daocloud.io/library/node:18-alpine AS builder

# apk 国内镜像：清华 → 中科大 → 阿里云（避免 dl-cdn.alpinelinux.org 超时）
RUN cp /etc/apk/repositories /etc/apk/repositories.bak \
 && ok=0 \
 && for mirror in mirrors.tuna.tsinghua.edu.cn mirrors.ustc.edu.cn mirrors.aliyun.com; do \
      cp /etc/apk/repositories.bak /etc/apk/repositories; \
      sed -i "s/dl-cdn.alpinelinux.org/${mirror}/g" /etc/apk/repositories; \
      if apk update && apk add --no-cache openssl; then ok=1; break; fi; \
    done \
 && test "$ok" -eq 1

ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

WORKDIR /app

COPY package*.json .npmrc ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm run build:seed

FROM docker.m.daocloud.io/library/node:18-alpine

ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

WORKDIR /app

RUN cp /etc/apk/repositories /etc/apk/repositories.bak \
 && ok=0 \
 && for mirror in mirrors.tuna.tsinghua.edu.cn mirrors.ustc.edu.cn mirrors.aliyun.com; do \
      cp /etc/apk/repositories.bak /etc/apk/repositories; \
      sed -i "s/dl-cdn.alpinelinux.org/${mirror}/g" /etc/apk/repositories; \
      if apk update && apk add --no-cache curl openssl; then ok=1; break; fi; \
    done \
 && test "$ok" -eq 1

COPY package*.json .npmrc ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY --from=builder /app/prisma/compiled/seed.js ./prisma/compiled/seed.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN npx prisma generate && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=8 --start-period=90s \
  CMD curl -f http://localhost:3000/api/stations || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
