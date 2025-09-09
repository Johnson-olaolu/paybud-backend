import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Role } from 'apps/gateway/types/vendor';

@Injectable()
export class RoleService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const newRole = await lastValueFrom(
      this.vendorProxy.send<Role>('createRole', createRoleDto),
    );
    return newRole;
  }

  async findAll() {
    const roles = await lastValueFrom(
      this.vendorProxy.send<Role[]>('findAllRole', {}),
    );
    return roles;
  }

  async findOne(id: string) {
    const role = await lastValueFrom(
      this.vendorProxy.send<Role>('findOneRole', id),
    );
    return role;
  }

  async findOneByName(name: string) {
    const role = await lastValueFrom(
      this.vendorProxy.send<Role>('findOneRoleByName', name),
    );
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await lastValueFrom(
      this.vendorProxy.send<Role>('updateRole', { id, ...updateRoleDto }),
    );
    return role;
  }

  async remove(id: string) {
    await lastValueFrom(this.vendorProxy.send<Role>('deleteRole', id));
  }
}
