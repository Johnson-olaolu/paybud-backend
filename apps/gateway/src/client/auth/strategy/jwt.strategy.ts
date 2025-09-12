import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { EnvironmentVariables } from 'apps/gateway/src/config/env.config';
import { Cache } from 'cache-manager';

interface JwtPayload {
  sub: string;
  email: string;
  tokenId: string;
}

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'client-jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET_KEY')!,
    });
  }
  async validate(payload: JwtPayload) {
    const { sub, tokenId } = payload;
    const cachedTokens =
      (await this.cacheManager.get<string[]>(`tokens:${sub}`)) || [];
    if (!cachedTokens.includes(tokenId)) {
      throw new UnauthorizedException('Invalid token');
    }
    const user = await this.authService.getUser(sub);
    return user;
  }
}
