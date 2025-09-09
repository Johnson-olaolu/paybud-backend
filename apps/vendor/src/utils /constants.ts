import { CreateRoleDto } from '../user/role/dto/create-role.dto';

export const defaultRoles: CreateRoleDto[] = [
  { name: 'super_admin', description: 'Site Super Admin' },
  { name: 'owner', description: 'Company Owner' },
  { name: 'admin', description: 'Company Admin' },
  { name: 'user', description: 'Company user' },
];
