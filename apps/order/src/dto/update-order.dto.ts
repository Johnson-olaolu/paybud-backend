import { CreateOrderDto } from './create-order.dto';
import { IsUUID } from 'class-validator';

export class UpdateOrderDto extends CreateOrderDto {
  @IsUUID()
  id: string;
}
