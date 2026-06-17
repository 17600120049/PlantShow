FROM node:18-alpine AS admin-build

WORKDIR /app

COPY admin-frontend/package*.json ./
RUN npm install

COPY admin-frontend/ .
RUN npm run build

FROM nginx:alpine

COPY nginx/conf.d /etc/nginx/conf.d
COPY --from=admin-build /app/dist /usr/share/nginx/html/admin

EXPOSE 80
