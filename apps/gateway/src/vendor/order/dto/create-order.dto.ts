import { InviteDetailsDto } from 'apps/order/src/dto/create-order.dto';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class VendorCreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @Type(() => InviteDetailsDto)
  inviteDetails: InviteDetailsDto;

  @IsString()
  @IsOptional()
  feesToBePaidBy?: 'VENDOR' | 'CLIENT' = 'VENDOR';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
