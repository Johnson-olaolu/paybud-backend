import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { EmailLoginDto } from './dto/email-login.dto';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { generateRandomString } from '../../utils/misc';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '../../config/env.config';
import ms, { StringValue } from 'ms';
import { ClientUser } from '@app/shared/types/client';

@Injectable()
export class AuthService {
  constructor(
    @Inject(RABBITMQ_QUEUES.CLIENT) private readonly clientProxy: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  sendGetTokenEmail(email: string) {
    this.clientProxy.emit('emailGetToken', email);
  }

  async loginWithEmail(emailLoginDto: EmailLoginDto) {
    const user = await lastValueFrom(
      this.clientProxy.send<ClientUser>('loginWithEmail', emailLoginDto),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return user;
  }

  async getUser(userId: string) {
    const user = await lastValueFrom<ClientUser>(
      this.clientProxy.send('findOneUser', userId),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return user;
  }

  async getToken(userId: string, email: string) {
    const tokenId = generateRandomString();
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        tokenId,
      },
      {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
      },
    );

    const cacheKey = `tokens:${userId}`;
    // const cacheValue = (await this.cacheManager.get<string[]>(cacheKey)) || [];
    const newCacheValue = [tokenId];
    await this.cacheManager.set(
      cacheKey,
      newCacheValue,
      ms(this.configService.get<StringValue>('JWT_REFRESH_TOKEN_EXPIRATION')!),
    );
    return {
      accessToken,
    };
  }
}
