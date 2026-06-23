# 国内服务器直连 DaoCloud，避免 registry-mirrors 误配为 google_containers
FROM docker.m.daocloud.io/library/node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm run build:seed

FROM docker.m.daocloud.io/library/node:18-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY --from=builder /app/prisma/compiled/seed.js ./prisma/compiled/seed.js
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN npx prisma generate && chmod +x ./docker-entrypoint.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=30s \
  CMD curl -f http://localhost:3000/api/stations || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
