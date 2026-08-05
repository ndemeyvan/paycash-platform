FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY shared-types/package*.json shared-types/
COPY transaction-service/package*.json transaction-service/
RUN npm ci --legacy-peer-deps

COPY shared-types/ shared-types/
COPY transaction-service/ transaction-service/

RUN npm run build:transaction

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/transaction-service/dist ./dist
EXPOSE 4001
CMD ["node", "dist/main.js"]
