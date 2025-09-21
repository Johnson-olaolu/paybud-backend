import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsFile } from 'nestjs-form-data';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(['vendor', 'client', 'app', 'other'])
  ownerType: 'vendor' | 'client' | 'app' | 'other';

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsUUID()
  ownerId: string;

  @IsFile()
  file: Express.Multer.File;
}
