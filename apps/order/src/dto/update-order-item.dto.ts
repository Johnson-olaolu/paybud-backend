import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';
import { OrderItemStatusEnum } from '../utils/constants';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsOptional()
  @IsEnum(OrderItemStatusEnum)
  status: OrderItemStatusEnum;
}
