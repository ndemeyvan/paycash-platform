import * as crypto from 'crypto';
import { Operator } from '../interfaces/index.js';
import {
  HMAC_SECRET,
  ORANGE_PREFIXES,
  MTN_PREFIXES,
} from '../constants/index.js';

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TRX-${timestamp}-${random}`;
}

export function generateHmacSignature(payload: string): string {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 32);
}

export function detectOperator(phoneNumber: string): Operator {
  const prefix = phoneNumber.substring(0, 2);

  if (ORANGE_PREFIXES.includes(prefix)) {
    return Operator.ORANGE;
  }

  if (MTN_PREFIXES.includes(prefix)) {
    return Operator.MTN;
  }

  throw new Error(
    "Impossible de détecter l'opérateur pour le numéro " + phoneNumber,
  );
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
