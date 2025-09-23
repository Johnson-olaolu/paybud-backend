import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Service } from './services/aws/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './config/env.config';
import { CreateFilesDto } from './dto/create-files.dto';
import * as mime from 'mime-types';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    private dataSource: DataSource,
    private configService: ConfigService<EnvironmentVariables>,
    private s3Service: S3Service,
  ) {}

  async createFile(createFileDto: CreateFileDto) {
    const timeStamp = Date.now() / 1000;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const file = this.fileRepository.create({
        ownerId: createFileDto.ownerId,
        ownerType: createFileDto.ownerType,
        label: createFileDto.label,
        folder: createFileDto.folder,
        fileName: createFileDto.file.originalname,
        mimeType: createFileDto.file.mimetype,
        size: createFileDto.file.size,
      });
      const savedFile = await queryRunner.manager.save(file);
      const key = `${createFileDto.ownerType}/${createFileDto.ownerId}/${createFileDto.folder}/${savedFile.id}-${timeStamp}.${mime.extension(savedFile.mimeType)}`;
      const metadata = {
        ownerId: createFileDto.ownerId,
        ownerType: createFileDto.ownerType,
        label: createFileDto.label,
        fileName: createFileDto.file.originalname,
        folder: createFileDto.folder,
      };
      const s3Details = await this.s3Service.uploadFile(
        key,
        createFileDto.file,
        metadata,
      );
      savedFile.s3Key = s3Details.key;
      savedFile.url = s3Details.url;
      savedFile.s3ETag = s3Details.etag!;
      savedFile.s3Bucket = this.configService.get('AWS_S3_BUCKET_NAME')!;
      savedFile.expirationDate = s3Details.expirationDate;
      await queryRunner.manager.save(savedFile);
      await queryRunner.commitTransaction();
      return savedFile;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to create file: ${error?.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createFiles(createFilesDto: CreateFilesDto) {
    const files = await Promise.all(
      createFilesDto.files.map((file) => {
        const createFileDto: CreateFileDto = {
          ...createFilesDto,
          file,
        };
        return this.createFile(createFileDto);
      }),
    );
    return files;
  }

  async findFileById(id: string) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new InternalServerErrorException(`File not found`);
    }
    if (file.expirationDate && file.expirationDate < new Date()) {
      const s3Details = await this.s3Service.getPresignedUrl(file.s3Key);
      file.url = s3Details.url;
      file.expirationDate = s3Details.expirationDate;
      await file.save();
    }
    return file;
  }

  async deleteFile(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const file = await this.fileRepository.findOne({ where: { id } });
      if (!file) {
        throw new InternalServerErrorException(`File not found`);
      }
      await this.s3Service.deleteFile(file.s3Key);
      await queryRunner.manager.delete(File, { id });
      await queryRunner.commitTransaction();
      return { message: 'File deleted successfully' };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to delete file: ${error?.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
