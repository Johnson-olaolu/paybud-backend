import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationTypeEnum } from '../../utils/constants';

export class CreateAppNotificationDto {
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

  @IsEnum(NotificationTypeEnum)
  @IsOptional()
  type?: NotificationTypeEnum;

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsOptional()
  data?: any;
}

export class CreateClientAppNotificationDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsEnum(NotificationTypeEnum)
  @IsOptional()
  type?: NotificationTypeEnum;

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsOptional()
  data?: any;
}

export class CreateVendorAppNotificationDto {
  @IsUUID()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsEnum(NotificationTypeEnum)
  @IsOptional()
  type?: NotificationTypeEnum;

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsOptional()
  data?: any;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];
}
