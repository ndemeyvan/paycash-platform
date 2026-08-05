import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '../interfaces/api-response.interface.js';
import type { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = `req_${crypto.randomBytes(8).toString('hex')}`;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'Operation completed successfully.',
        data: data as T,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          path: request.url,
        },
      })),
    );
  }
}
