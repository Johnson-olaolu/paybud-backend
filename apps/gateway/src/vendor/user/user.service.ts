import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from 'apps/gateway/types/vendor';

@Injectable()
export class UserService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private readonly vendorProxy: ClientProxy,
  ) {}

  async findAll() {
    const users = await lastValueFrom(
      this.vendorProxy.send<User[]>('findAllUser', {}),
    ).catch((err: { message: string }) => {
      throw new RpcException(err.message);
    });
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
