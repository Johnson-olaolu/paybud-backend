import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderInviteMediumEnum } from '../utils/constants';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order-item.dto';

export class InviteDetailsDto {
  @IsEnum(OrderInviteMediumEnum)
  medium: OrderInviteMediumEnum;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;
}

export class CreateOrderDto {
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
  feesToBePaidBy?: 'VENDOR' | 'CLIENT';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}

export class VendorCreateOrderDto extends CreateOrderDto {
  @IsUUID()
  vendorId: string;
}

export class ClientCreateOrderDto extends CreateOrderDto {
  @IsUUID()
  clientId: string;
}
