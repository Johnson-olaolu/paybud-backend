import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsFiles } from 'nestjs-form-data';

export class CreateFilesDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  folder: string;

  @IsEnum(['vendor', 'client', 'app', 'other'])
  ownerType: 'vendor' | 'client' | 'app' | 'other';

  @IsUUID()
  ownerId: string;

  @IsFiles()
  files: Express.Multer.File[];
}
