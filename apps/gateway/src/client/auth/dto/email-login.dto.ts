import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  token: string;
}
