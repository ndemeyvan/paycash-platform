FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared-types/package*.json shared-types/
COPY notification-service/package*.json notification-service/
RUN npm ci --legacy-peer-deps

COPY shared-types/ shared-types/
COPY notification-service/ notification-service/

RUN npm run build:notification

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/notification-service/dist ./dist
EXPOSE 4004
CMD ["node", "dist/main.js"]
