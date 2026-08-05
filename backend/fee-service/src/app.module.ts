import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeesModule } from './modules/fees/fees.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), FeesModule, HealthModule],
})
export class AppModule {}
