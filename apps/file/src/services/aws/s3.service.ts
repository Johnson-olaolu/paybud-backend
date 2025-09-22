/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env.config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { addSeconds } from 'date-fns';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      },
    });
  }

  async uploadFile(
    key: string,
    file: Express.Multer.File,
    metadata: Record<string, string> = {},
  ) {
    try {
      const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
      const res = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: Buffer.from(file.buffer),
          ContentType: file.mimetype,
          Metadata: metadata,
        }),
      );

      const presignedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
        { expiresIn: this.configService.get('S3_PRESIGN_EXPIRATION') },
      );

      const expirationDate = addSeconds(
        new Date(),
        this.configService.get('S3_PRESIGN_EXPIRATION')!,
      );

      return {
        key,
        url: presignedUrl,
        expirationDate: expirationDate,
        etag: res.ETag,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to upload file: ${error?.message}`,
      );
    }
  }

  async getPresignedUrl(key: string) {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    try {
      const presignedUrl = await getSignedUrl(
        this.s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
        { expiresIn: this.configService.get('S3_PRESIGN_EXPIRATION') },
      );

      const expirationDate = addSeconds(
        new Date(),
        this.configService.get('S3_PRESIGN_EXPIRATION')!,
      );

      return {
        key,
        url: presignedUrl,
        expirationDate: expirationDate,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to get presigned URL: ${error?.message}`,
      );
    }
  }

  async deleteFile(key: string) {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
      return { message: 'File deleted successfully' };
    } catch (error: any) {
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to delete file: ${error?.message}`,
      );
    }
  }
}
