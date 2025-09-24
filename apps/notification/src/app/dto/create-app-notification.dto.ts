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

  @IsString()
  @IsNotEmpty()
  clientType: 'vendor' | 'client' | 'admin';

  @IsOptional()
  data?: any;
}

export class CreateAppNotificationBusinessDto {
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

  @IsString()
  @IsNotEmpty()
  clientType: 'vendor' | 'client' | 'admin';

  @IsOptional()
  data?: any;
}
