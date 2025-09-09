import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('vendor/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    const data = await this.roleService.create(createRoleDto);
    return {
      success: true,
      message: 'Role created successfully',
      data,
    };
  }

  @Get()
  async findAll() {
    const data = await this.roleService.findAll();
    return {
      success: true,
      message: 'Roles fetched successfully',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.roleService.findOne(id);
    return {
      success: true,
      message: 'Role fetched successfully',
      data,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    const data = await this.roleService.update(id, updateRoleDto);
    return {
      success: true,
      message: 'Role updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return {
      success: true,
      message: 'Role deleted successfully',
    };
  }
}
