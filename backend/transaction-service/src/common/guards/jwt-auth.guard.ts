import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { JWT_CONFIG } from '../../types/index.js';
import * as crypto from 'crypto';

interface JwtPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { userId: string; username: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer ')
    ) {
      this.logger.warn('Missing or invalid Authorization header');
      return false;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.verifyToken(token);

      if (!payload || !payload.sub) {
        this.logger.warn('Invalid token payload');
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        this.logger.warn('Token expired');
        return false;
      }

      request.user = { userId: payload.sub, username: payload.username };
      return true;
    } catch (error) {
      this.logger.error(`Token verification failed: ${String(error)}`);
      return false;
    }
  }

  private verifyToken(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_CONFIG.SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (expectedSignature !== signatureB64) {
      return null;
    }

    try {
      const payloadJson = Buffer.from(payloadB64, 'base64url').toString(
        'utf-8',
      );
      return JSON.parse(payloadJson) as JwtPayload;
    } catch {
      return null;
    }
  }
}
