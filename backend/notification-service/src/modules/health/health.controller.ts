import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Vérifier l'état du service de notifications" })
  check() {
    return {
      status: 'ok',
      service: 'notification-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
