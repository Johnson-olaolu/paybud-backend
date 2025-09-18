import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendAppNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsEnum(['info', 'warning', 'error', 'success'])
  @IsOptional()
  type?: 'info' | 'warning' | 'error' | 'success';

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsString()
  @IsNotEmpty()
  clientType: 'vendor' | 'client' | 'admin';

  @IsOptional()
  data?: any;
}

export class SendEmailNotificationDto {
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

export class SendSMSNotificationDto {}
