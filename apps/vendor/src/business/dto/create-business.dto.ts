import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateBusinessDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsPhoneNumber()
  contactPhoneNumber?: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  @IsNotEmpty()
  businessAccountName: string;

  @IsString()
  @IsNotEmpty()
  businessAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  businessBankCode: string;

  @IsNumberString()
  @Length(11, 11)
  businessBVN: string;

  // @IsString()
  // @IsOptional()
  // businessCurrency: string;
}
