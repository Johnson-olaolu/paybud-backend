import { CreateRoleDto } from '../user/role/dto/create-role.dto';

export const defaultRoles: CreateRoleDto[] = [
  { name: 'super_admin', description: 'Site Super Admin' },
  { name: 'owner', description: 'Company Owner' },
  { name: 'admin', description: 'Company Admin' },
  { name: 'user', description: 'Company user' },
];

export enum RegistrationTypeEnum {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  GITHUB = 'GITHUB',
}

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

export enum WalletCurrencyEnum {
  // USD = 'USD',
  // EUR = 'EUR',
  // GBP = 'GBP',
  NGN = 'NGN',
  // GHS = 'GHS',
  // ZAR = 'ZAR',
  // KES = 'KES',
  // UGX = 'UGX',
  // TZS = 'TZS',
  // RWF = 'RWF',
}

export const JOB_NAMES = {
  CREATE_BUSINESS: 'CREATE_BUSINESS',
};
