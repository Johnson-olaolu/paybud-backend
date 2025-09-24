import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrderInviteMediumEnum } from '../utils/constants';
import { Type } from 'class-transformer';

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

export class VendorCreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  vendorId: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Type(() => InviteDetailsDto)
  inviteDetails: InviteDetailsDto;
}

export class ClientCreateOrderDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  clientId: string;

  @IsUUID()
  vendorId: string;

  @IsNumber()
  @IsOptional()
  amount: number;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @Type(() => InviteDetailsDto)
  inviteDetails: InviteDetailsDto;
}
