import { CreateRoleDto } from '../user/role/dto/create-role.dto';

export const defaultRoles: CreateRoleDto[] = [
  { name: 'super_admin', description: 'Site Super Admin' },
  { name: 'owner', description: 'Company Owner' },
  { name: 'admin', description: 'Company Admin' },
  { name: 'user', description: 'Company user' },
];

export enum WalletTransactionStatusEnum {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
  EXPIRED = 'EXPIRED',
}

export enum WalletTransactionActionEnum {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum WalletTransactionTypeEnum {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  PURCHASE = 'PURCHASE',
}

export enum WalletStatusEnum {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}
