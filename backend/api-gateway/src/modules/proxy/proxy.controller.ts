import {
  Controller,
  All,
  Param,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SERVICE_URLS } from '../../types/index.js';

@ApiTags('Proxy')
@Controller('api')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(private readonly httpService: HttpService) {}

  @All(':service/*')
  async proxyRequest(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const serviceUrl = this.getServiceUrl(service);

    const remainingPath = req.originalUrl.replace(`/api/${service}`, '') || '/';

    this.logger.log(
      `Proxying ${req.method} /api/${service} -> ${serviceUrl}${remainingPath}`,
    );

    const forwardHeaders: Record<string, string> = {};
    if (req.headers.authorization) {
      forwardHeaders['authorization'] = req.headers.authorization;
    }
    if (req.headers['content-type']) {
      forwardHeaders['content-type'] = req.headers['content-type'];
    }

    try {
      const response = await this.httpService.axiosRef({
        method: req.method,
        url: `${serviceUrl}${remainingPath}`,
        data: req.body as unknown,
        headers: forwardHeaders,
        timeout: 10000,
      });

      res.status(response.status).json(response.data);
    } catch (err: unknown) {
      const error = err as {
        response?: { status: number; data: unknown };
        message?: string;
      };
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        this.logger.error(`Proxy error: ${error.message ?? String(err)}`);
        res.status(502).json({
          statusCode: 502,
          message: 'Service indisponible',
          error: 'Bad Gateway',
        });
      }
    }
  }

  private getServiceUrl(service: string): string {
    switch (service) {
      case 'transactions':
        return SERVICE_URLS.TRANSACTION_SERVICE;
      case 'partners':
        return SERVICE_URLS.PARTNER_SERVICE;
      case 'fees':
        return SERVICE_URLS.FEE_SERVICE;
      case 'notifications':
        return SERVICE_URLS.NOTIFICATION_SERVICE;
      default:
        throw new Error(`Service inconnu: ${service}`);
    }
  }
}
