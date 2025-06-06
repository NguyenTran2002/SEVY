FROM node:16-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production
ENV CI=true

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
