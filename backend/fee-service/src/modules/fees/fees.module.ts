import { Module } from '@nestjs/common';
import { FeesController } from './controllers/fees.controller.js';
import { FeesService } from './services/fees.service.js';

@Module({
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
