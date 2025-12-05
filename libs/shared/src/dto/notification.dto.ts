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
  @IsString()
  @IsNotEmpty()
  clientType: 'vendor' | 'client' | 'admin';

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

  @IsOptional()
  data?: any;
}

export class SendClientAppNotificationDto {
  @IsUUID()
  clientId: string;

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

  @IsOptional()
  data?: any;
}

export class SendVendorAppNotificationDto {
  @IsUUID()
  businessId: string;

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

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
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

export class SendSMSNotificationDto {}
