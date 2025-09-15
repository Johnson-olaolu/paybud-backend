import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAppNotificationDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsBoolean()
  @IsOptional()
  popup: boolean;

  @IsOptional()
  data: any;
}
