import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class GetUserByEmailOrPhoneDTO {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;
}
