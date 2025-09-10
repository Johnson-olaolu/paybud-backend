/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from 'apps/gateway/types/vendor';
import { EnvironmentVariables } from '../../config/env.config';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { generateRandomString } from '../../utils/misc';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await lastValueFrom<User>(
      this.vendorProxy.send('createUser', registerDto),
    ).catch((error) => {
      throw new RpcException(error.message);
    });
    return user;
  }

  async resendVerificationEmail(email: string) {
    const user = await lastValueFrom(
      this.vendorProxy.send<User>('resendVerificationEmail', email),
    ).catch((error) => {
      throw new RpcException(error.message);
    });
    return user;
  }

  async getUser(userId: string) {
    const user = await lastValueFrom<User>(
      this.vendorProxy.send('findOneUser', userId),
    ).catch((error) => {
      console.log(error);
      throw new RpcException(error.message);
    });
    return user;
  }

  async getAuthenticatedUser(email: string, password: string) {
    const user = await lastValueFrom<User>(
      this.vendorProxy.send('authenticateUser', { email, password }),
    ).catch((error) => {
      throw new RpcException(error.message);
    });
    return user;
  }

  async getTokens(userId: string, email: string) {
    const tokenId = generateRandomString();
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenId,
        },
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          tokenId,
        },
        {
          secret: this.configService.get('JWT_SECRET_KEY'),
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
        },
      ),
    ]);
    const cacheKey = `tokens:${userId}`;
    // const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    const newCacheValue = [tokenId];
    await this.cacheManager.set(
      cacheKey,
      newCacheValue,
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(token: string) {
    const decoded = this.jwtService.decode<{
      sub: string;
      tokenId: string;
      email: string;
    }>(token);
    if (!decoded || !decoded.sub || !decoded.tokenId || !decoded.email) {
      throw new BadRequestException('Invalid token');
    }
    const userId = decoded.sub;
    const cacheKey = `tokens:${userId}`;
    const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    if (!cacheValue.includes(decoded.tokenId)) {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.getUser(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.getTokens(userId, decoded.email);
  }

  async logout(userId: string, token: string) {
    const decoded = this.jwtService.decode<{ sub: string; tokenId: string }>(
      token,
    );
    if (!decoded || !decoded.sub || !decoded.tokenId) {
      throw new BadRequestException('Invalid token');
    }
    if (decoded.sub !== userId) {
      throw new BadRequestException('Invalid token for user');
    }
    const tokenId = decoded.tokenId;
    const cacheKey = `tokens:${userId}`;
    const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    const newCacheValue = cacheValue.filter((id) => id !== tokenId);
    await this.cacheManager.set(
      cacheKey,
      newCacheValue,
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    );
  }
}
