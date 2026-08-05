FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared-types/package*.json shared-types/
COPY api-gateway/package*.json api-gateway/
RUN npm ci --legacy-peer-deps

COPY shared-types/ shared-types/
COPY api-gateway/ api-gateway/

RUN npm run build:gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/api-gateway/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main.js"]
