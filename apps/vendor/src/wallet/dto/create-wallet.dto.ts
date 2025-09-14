import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletCurrencyEnum } from '../../utils /constants';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  paystackCustomerCode: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsEnum(WalletCurrencyEnum)
  currency?: WalletCurrencyEnum;
}
