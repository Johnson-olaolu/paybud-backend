import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BidDetails, MessageTypeEnum } from '../../utils/constants';
import { Type } from 'class-transformer';

export class CreateChatMessageDto {
  @IsUUID()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  uniqueId: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(MessageTypeEnum)
  type: MessageTypeEnum;

  @Type(() => BidDetails)
  @IsOptional()
  bidDetails: BidDetails;

  @IsUUID()
  @IsOptional()
  replyToId: string;
}
