import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Vérifier l'état du service de frais" })
  check() {
    return {
      status: 'ok',
      service: 'fee-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
