import { IsNotEmpty, IsString } from 'class-validator';

export class FacebookLoginDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}
