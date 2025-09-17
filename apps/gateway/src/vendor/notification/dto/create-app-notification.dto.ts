import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAppNotificationDto {
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsEnum(['info', 'success', 'warning', 'error'])
  @IsOptional()
  type?: 'info' | 'success' | 'warning' | 'error';

  @IsBoolean()
  @IsOptional()
  popup?: boolean;

  @IsString()
  @IsNotEmpty()
  clientType: 'vendor' | 'client' | 'admin';

  @IsOptional()
  data: any;
}
