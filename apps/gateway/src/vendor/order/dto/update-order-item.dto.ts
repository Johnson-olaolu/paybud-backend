import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { VendorCreateOrderItemDto } from './create-order-item.dto';
import { OrderItemStatusEnum } from '@app/shared/types/order';

export class VendorUpdateOrderItemDto extends VendorCreateOrderItemDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsOptional()
  @IsEnum(OrderItemStatusEnum)
  status: OrderItemStatusEnum;
}
