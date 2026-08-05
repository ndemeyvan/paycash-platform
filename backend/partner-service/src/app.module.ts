import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PartnersModule } from './modules/partners/partners.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PartnersModule,
    HealthModule,
  ],
})
export class AppModule {}
