import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto } from './login.dto.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Générer un token JWT',
    description:
      "S'authentifie et retourne un token JWT à utiliser dans le header Authorization: Bearer <token>",
  })
  @ApiResponse({
    status: 201,
    description: 'Token JWT généré',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MDYwMDAwMDAsImV4cCI6MTcwNjA4NjQwMH0.signature',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  login(@Body() dto: LoginDto) {
    const result = this.authService.login(dto.username, dto.password);

    if (!result) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return result;
  }
}
