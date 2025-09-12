import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
