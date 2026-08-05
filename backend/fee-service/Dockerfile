FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared-types/package*.json shared-types/
COPY fee-service/package*.json fee-service/
RUN npm ci --legacy-peer-deps

COPY shared-types/ shared-types/
COPY fee-service/ fee-service/

RUN npm run build:fee

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/fee-service/dist ./dist
EXPOSE 4003
CMD ["node", "dist/main.js"]
