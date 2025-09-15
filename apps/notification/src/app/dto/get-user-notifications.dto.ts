import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GetUserNotificationsDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsDate()
  cursor?: Date;
}
