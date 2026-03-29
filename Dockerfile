# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY public/config.js.template /usr/share/nginx/html/config.js.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/entrypoint.sh"]
