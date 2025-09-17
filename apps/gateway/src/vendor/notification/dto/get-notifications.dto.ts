import { IsBoolean, IsDate, IsOptional, IsUUID } from 'class-validator';

export class GetNotificationsDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsDate()
  cursor?: Date;

  @IsOptional()
  limit?: number;
}
