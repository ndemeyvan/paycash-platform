export interface ITransaction {
  id: string;
  phoneNumber: string;
  amount: number;
  operator: Operator;
  reference: string;
  fees: number;
  status: TransactionStatus;
  metadata: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ITransactionResponse {
  transactionId: string;
  status: TransactionStatus;
  signature: string;
  fees: number;
  createdAt: string;
}

export interface ITransactionStatus {
  id: string;
  status: TransactionStatus;
  amount: number;
  phoneNumber: string;
  fees: number;
  createdAt: string;
  updatedAt?: string;
  errorMessage?: string;
}

export interface IPartner {
  id: string;
  name: string;
  operator: Operator;
  apiKey: string;
  apiUrl: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IFeeCalculation {
  amount: number;
  operator: Operator;
  transactionType: TransactionType;
  userPaysFees: boolean;
}

export interface IFeeResponse {
  total: number;
  baseFee: number;
  tax: number;
  rate: number;
  transactionType: TransactionType;
  grossAmount: number;
  netAmount: number;
}

export enum Operator {
  ORANGE = 'ORANGE',
  MTN = 'MTN',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionType {
  P2P = 'P2P',
  MERCHANT = 'MERCHANT',
  BILL = 'BILL',
  AIRTIME = 'AIRTIME',
}

export type { ApiResponse } from './api-response.interface.js';
