/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from 'apps/gateway/types/vendor';

@Injectable()
export class AuthService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await lastValueFrom<User>(
      this.vendorProxy.send('createUser', registerDto),
    ).catch((error) => {
      throw new RpcException(error.message);
    });
    return user;
  }
}
