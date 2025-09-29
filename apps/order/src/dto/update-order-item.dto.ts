import { IsOptional, IsUUID } from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class UpdateOrderItemDto extends CreateOrderItemDto {
  @IsUUID()
  @IsOptional()
  id: string;
}
