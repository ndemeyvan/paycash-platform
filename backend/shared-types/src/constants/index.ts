export const PORTS = {
  API_GATEWAY: 4000,
  TRANSACTION_SERVICE: 4001,
  PARTNER_SERVICE: 4002,
  FEE_SERVICE: 4003,
  NOTIFICATION_SERVICE: 4004,
} as const;

export const SERVICE_URLS = {
  TRANSACTION_SERVICE:
    process.env.TRANSACTION_SERVICE_URL || 'http://localhost:4001',
  PARTNER_SERVICE: process.env.PARTNER_SERVICE_URL || 'http://localhost:4002',
  FEE_SERVICE: process.env.FEE_SERVICE_URL || 'http://localhost:4003',
  NOTIFICATION_SERVICE:
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004',
} as const;

export const HMAC_SECRET =
  process.env.HMAC_SECRET || 'paycash-default-secret-2024';

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'paycash-jwt-secret-key-2024',
  EXPIRES_IN: '24h',
} as const;

export const ORANGE_PREFIXES = ['65', '67', '69', '70'];
export const MTN_PREFIXES = ['66', '68'];

export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 100,
  MAX_AMOUNT: 1000000,
  DAILY_LIMIT: 5000000,
} as const;

export const FEE_TAX_RATE = 0.02;
