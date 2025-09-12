import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  avatarUrl: string;
}
