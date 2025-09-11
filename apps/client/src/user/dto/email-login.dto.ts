import { IsEmail, IsString, Length } from 'class-validator';

export class EmailLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 8)
  token: string;
}
