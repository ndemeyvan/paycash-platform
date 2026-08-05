import { Module } from '@nestjs/common';
import { PartnerController } from './controllers/partner.controller.js';
import { PartnerService } from './services/partner.service.js';

@Module({
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class PartnersModule {}
