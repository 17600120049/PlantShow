FROM node:18-alpine AS admin-build

WORKDIR /app

COPY admin-frontend/package*.json ./
RUN npm install

COPY admin-frontend/ .
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache openssl

COPY nginx/conf.d-templates /etc/nginx/conf.d-templates
COPY nginx/snippets /etc/nginx/snippets
COPY nginx/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh \
  && rm -f /etc/nginx/conf.d/default.conf

COPY --from=admin-build /app/dist /usr/share/nginx/html/admin

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
