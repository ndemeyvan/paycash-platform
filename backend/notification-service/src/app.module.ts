import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
