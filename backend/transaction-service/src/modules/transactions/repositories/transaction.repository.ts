import { Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity.js';
import { TransactionStatus } from '../../../types/index.js';

@Injectable()
export class TransactionRepository {
  private readonly logger = new Logger(TransactionRepository.name);
  private transactions: Map<string, Transaction> = new Map();

  save(transaction: Transaction): Promise<Transaction> {
    this.transactions.set(transaction.id, { ...transaction });
    this.logger.debug(`Transaction saved: ${transaction.id}`);
    return Promise.resolve(transaction);
  }

  findById(id: string): Promise<Transaction | null> {
    const transaction = this.transactions.get(id);
    if (transaction) {
      this.logger.debug(`Transaction found: ${id}`);
    } else {
      this.logger.debug(`Transaction not found: ${id}`);
    }
    return Promise.resolve(transaction || null);
  }

  findAll(): Promise<Transaction[]> {
    return Promise.resolve(Array.from(this.transactions.values()));
  }

  findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ items: Transaction[]; total: number }> {
    const all = Array.from(this.transactions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    return Promise.resolve({ items, total });
  }

  findByPhoneNumberPaginated(
    phoneNumber: string,
    page: number,
    limit: number,
  ): Promise<{ items: Transaction[]; total: number }> {
    const all = Array.from(this.transactions.values())
      .filter((tx) => tx.phoneNumber === phoneNumber)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);
    return Promise.resolve({ items, total });
  }

  updateStatus(
    id: string,
    status: TransactionStatus,
    errorMessage?: string,
  ): Promise<Transaction | null> {
    const transaction = this.transactions.get(id);
    if (!transaction) return Promise.resolve(null);

    transaction.status = status;
    transaction.updatedAt = new Date();
    if (errorMessage) {
      transaction.errorMessage = errorMessage;
    }

    this.transactions.set(id, transaction);
    this.logger.debug(`Transaction status updated: ${id} -> ${status}`);
    return Promise.resolve(transaction);
  }
}
