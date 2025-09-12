import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ClientUser } from 'apps/gateway/types/client';

@Injectable()
export class UserService {
  constructor(
    @Inject(RABBITMQ_QUEUES.CLIENT) private readonly clientProxy: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await lastValueFrom(
      this.clientProxy.send<ClientUser>('createUser', createUserDto),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return user;
  }

  async findAll() {
    const users = await lastValueFrom<ClientUser[]>(
      this.clientProxy.send('findAllUser', {}),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return users;
  }

  async findOne(id: string) {
    const user = await lastValueFrom<ClientUser>(
      this.clientProxy.send('findOneUser', id),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return user;
  }
}
