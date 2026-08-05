import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(username: string, password: string): { access_token: string } | null {
    if (password !== 'paycash2024') return null;

    const payload = { sub: username, username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
