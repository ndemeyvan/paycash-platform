import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TransactionController } from './controllers/transaction.controller.js';
import { TransactionService } from './services/transaction.service.js';
import { TransactionRepository } from './repositories/transaction.repository.js';

@Module({
  imports: [HttpModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionsModule {}
