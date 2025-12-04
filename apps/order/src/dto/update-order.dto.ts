import { CreateOrderDto } from './create-order.dto';
import { IsUUID } from 'class-validator';
import { UpdateOrderItemDto } from './update-order-item.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['inviteDetails'] as const),
) {
  @IsUUID()
  id: string;

  declare orderItems: UpdateOrderItemDto[];
}
