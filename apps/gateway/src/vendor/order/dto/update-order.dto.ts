import { PartialType } from '@nestjs/swagger';
import { VendorCreateOrderDto } from './create-order.dto';
import { IsUUID } from 'class-validator';
import { VendorUpdateOrderItemDto } from './update-order-item.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateOrderDto extends PartialType(
  OmitType(VendorCreateOrderDto, ['inviteDetails'] as const),
) {
  @IsUUID()
  id: string;

  declare orderItems: VendorUpdateOrderItemDto[];
}
