import { PartialType } from '@nestjs/swagger';
import { VendorCreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(VendorCreateOrderDto) {}
