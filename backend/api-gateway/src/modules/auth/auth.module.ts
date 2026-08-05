import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_CONFIG } from '../../types/index.js';
import { JwtStrategy } from './jwt.strategy.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_CONFIG.SECRET,
      signOptions: { expiresIn: JWT_CONFIG.EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, JwtAuthGuard, AuthService],
  exports: [JwtModule, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
