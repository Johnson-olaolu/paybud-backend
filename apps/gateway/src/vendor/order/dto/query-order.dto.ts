import { OrderStatusEnum } from '@app/shared/types/order/';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class VendorQueryOrderDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsEnum(OrderStatusEnum)
  @IsOptional()
  status?: OrderStatusEnum;
}
