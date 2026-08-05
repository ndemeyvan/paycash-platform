import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = `req_${crypto.randomBytes(8).toString('hex')}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erreur interne du serveur';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        const msg = resp.message;
        message = Array.isArray(msg)
          ? (msg as string[]).join('; ')
          : (msg as string) || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.stack}`);
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json({
      success: false,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        path: request.url,
      },
    });
  }
}
