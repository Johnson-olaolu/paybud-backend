import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'client-local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'token',
    });
  }
  async validate(email: string, password: string) {
    return await this.authService.loginWithEmail({ email, token: password });
  }
}
