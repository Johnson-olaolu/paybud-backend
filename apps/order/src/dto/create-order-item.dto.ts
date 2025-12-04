import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { OrderItemImportanceLevelEnum } from '../utils/constants';

export class CreateOrderItemDto {
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
