import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const role = await this.roleRepository.save(createRoleDto);
    return role;
  }

  async findAll() {
    const roles = await this.roleRepository.find();
    return roles;
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOneOrFail({ where: { id } });
    return role;
  }

  async findOneByName(name: string) {
    const role = await this.roleRepository.findOneOrFail({ where: { name } });
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.roleRepository.findOneOrFail({ where: { id } });
    for (const key in updateRoleDto) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role[key] = updateRoleDto[key];
    }
    return role.save();
  }

  async remove(id: string) {
    const result = await this.roleRepository.softDelete({ id });
    if (!result.affected) {
      throw new NotFoundException('No Role found for this ID');
    }
    return result.affected;
  }
}
