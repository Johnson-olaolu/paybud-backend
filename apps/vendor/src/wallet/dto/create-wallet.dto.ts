import { IsEnum } from 'class-validator';
import { WalletCurrencyEnum } from '../../utils /constants';

export class CreateWalletDto {
  @IsEnum(WalletCurrencyEnum)
  currency?: WalletCurrencyEnum;
}
