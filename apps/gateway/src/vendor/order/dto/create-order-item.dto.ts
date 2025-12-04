import { OrderItemImportanceLevelEnum } from '@app/shared/types/order';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class VendorCreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUUID('all', { each: true })
  fileIds: string[];

  @IsEnum(OrderItemImportanceLevelEnum)
  @IsOptional()
  importanceLevel: OrderItemImportanceLevelEnum;
}
