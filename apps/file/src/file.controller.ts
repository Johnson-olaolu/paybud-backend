import { Controller } from '@nestjs/common';
import { FileService } from './file.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateFilesDto } from './dto/create-files.dto';
import { CreateFileDto } from './dto/create-file.dto';

@Controller()
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @MessagePattern('createFile')
  async createFile(createFileDto: CreateFileDto) {
    return this.fileService.createFile(createFileDto);
  }

  @MessagePattern('createFiles')
  async createFiles(createFilesDto: CreateFilesDto) {
    return this.fileService.createFiles(createFilesDto);
  }

  @MessagePattern('getFile')
  async getFile(fileId: string) {
    return this.fileService.findFileById(fileId);
  }

  @MessagePattern('deleteFile')
  async deleteFile(fileId: string) {
    return this.fileService.deleteFile(fileId);
  }
}
