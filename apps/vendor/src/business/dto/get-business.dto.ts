import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class GetBusinessByEmailOrPhoneDTO {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;
}
