import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module.js';
import { ProxyController } from './proxy.controller.js';

@Module({
  imports: [HttpModule, AuthModule],
  controllers: [ProxyController],
})
export class ProxyModule {}
