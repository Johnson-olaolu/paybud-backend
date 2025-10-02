import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from '@app/shared/types/vendor';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class UserService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private readonly vendorProxy: ClientProxy,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async findAll() {
    const users = await lastValueFrom(
      this.vendorProxy.send<User[]>('findAllUser', {}),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return users;
  }

  async findOne(id: string) {
    const user = await lastValueFrom(
      this.vendorProxy.send<User>('findOneUser', id),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const cacheKey = `user:${id}`;
    const user = await lastValueFrom(
      this.vendorProxy.send<User>('updateUser', { id, updateUserDto }),
    ).catch((error) => {
      throw new RpcException(error);
    });
    await this.cacheManager.del(cacheKey);
    return user;
  }

  async updateProfile(id: string, updateUserDto: UpdateProfileDto) {
    const cacheKey = `user:${id}`;
    const user = await lastValueFrom(
      this.vendorProxy.send<User>('updateUserProfile', { id, updateUserDto }),
    ).catch((error) => {
      throw new RpcException(error);
    });
    await this.cacheManager.del(cacheKey);
    return user;
  }

  async remove(id: string) {
    const cacheKey = `user:${id}`;
    const user = await lastValueFrom(
      this.vendorProxy.send<User>('removeUser', id),
    ).catch((error) => {
      throw new RpcException(error);
    });
    await this.cacheManager.del(cacheKey);
    return user;
  }
}
