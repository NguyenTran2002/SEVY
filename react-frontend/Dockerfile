FROM node:16-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci || npm install

ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
ENV CI=true

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
RUN apk add --no-cache gettext \
 && rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
