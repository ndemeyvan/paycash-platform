import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from './modules/transactions/transactions.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TransactionsModule,
    HealthModule,
  ],
})
export class AppModule {}
