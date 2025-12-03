import { CreateOrderDto } from './create-order.dto';
import { IsUUID } from 'class-validator';
import { UpdateOrderItemDto } from './update-order-item.dto';

export class UpdateOrderDto extends CreateOrderDto {
  @IsUUID()
  id: string;

  declare orderItems: UpdateOrderItemDto[];
}
