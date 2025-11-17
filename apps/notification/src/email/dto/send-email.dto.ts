import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  subject: string;
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class SendClientEmailDto {
  @IsUUID()
  clientId: string;
  @IsString()
  @IsNotEmpty()
  subject: string;
  @IsString()
  @IsNotEmpty()
  body: string;
}

export class SendVendorEmailDto {
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsString()
  @IsNotEmpty()
  subject: string;
  @IsString()
  @IsNotEmpty()
  body: string;
}
