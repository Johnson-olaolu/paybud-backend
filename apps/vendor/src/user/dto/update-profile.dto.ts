import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  contactEmail: string;

  @IsPhoneNumber()
  contactPhoneNumber: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  sex: 'MALE' | 'FEMALE' | 'OTHER';

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUUID()
  @IsOptional()
  profilePictureId?: string;
}
