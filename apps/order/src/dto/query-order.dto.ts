import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatusEnum } from '../utils/constants';

export class QueryOrderDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsUUID()
  @IsOptional()
  vendorId: string;

  @IsUUID()
  @IsOptional()
  clientId: string;

  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status: OrderStatusEnum;
}
