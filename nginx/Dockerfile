FROM docker.m.daocloud.io/library/node:18-alpine AS admin-build

WORKDIR /app

COPY admin-frontend/package*.json admin-frontend/.npmrc ./
RUN npm install

COPY admin-frontend/ .
RUN npm run build

FROM docker.m.daocloud.io/library/nginx:alpine

RUN cp /etc/apk/repositories /etc/apk/repositories.bak \
 && ok=0 \
 && for mirror in mirrors.tuna.tsinghua.edu.cn mirrors.ustc.edu.cn mirrors.aliyun.com; do \
      cp /etc/apk/repositories.bak /etc/apk/repositories; \
      sed -i "s/dl-cdn.alpinelinux.org/${mirror}/g" /etc/apk/repositories; \
      if apk update && apk add --no-cache openssl; then ok=1; break; fi; \
    done \
 && test "$ok" -eq 1

COPY nginx/conf.d-templates /etc/nginx/conf.d-templates
COPY nginx/snippets /etc/nginx/snippets
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh \
  && rm -f /etc/nginx/conf.d/default.conf

COPY --from=admin-build /app/dist /usr/share/nginx/html/admin

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
