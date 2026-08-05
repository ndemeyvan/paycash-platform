import { TransactionStatus, Operator } from '../../../types/index.js';

export class Transaction {
  id!: string;
  phoneNumber!: string;
  amount!: number;
  operator!: Operator;
  reference!: string;
  fees!: number;
  status!: TransactionStatus;
  metadata!: Record<string, unknown>;
  errorMessage?: string;
  createdAt!: Date;
  updatedAt?: Date;
}
