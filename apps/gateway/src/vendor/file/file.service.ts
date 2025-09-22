import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateFileDto } from './dto/create-file.dto';
import { lastValueFrom } from 'rxjs';
import { File } from '@app/shared/types';
import { fetchFileById } from '@app/shared/utils/misc';

@Injectable()
export class FileService {
  constructor(
    @Inject(RABBITMQ_QUEUES.FILE) private readonly fileProxy: ClientProxy,
  ) {}

  async uploadFile(
    userId: string,
    folder: string,
    label: string,
    file: Express.Multer.File,
  ) {
    const createFileDto: CreateFileDto = {
      ownerId: userId,
      ownerType: 'vendor',
      folder,
      label,
      file,
    };
    return await lastValueFrom(
      this.fileProxy.send<File>('createFile', createFileDto),
    ).catch((err) => {
      throw new RpcException(err);
    });
  }

  async getFile(fileId: string) {
    return await fetchFileById(fileId);
  }
}
