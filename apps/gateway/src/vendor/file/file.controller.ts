/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { User } from 'apps/gateway/types/vendor';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Vendor File')
@Controller('vendor/file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
        },
        label: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async createFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1e7 }),
          // new FileTypeValidator({ fileType: 'image/*' }),
        ],
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
    @Body('folder') folder: string,
    @Body('label') label: string,
  ) {
    const user = (request as any)?.user as User;
    console.log({ folder, label });
    const data = await this.fileService.uploadFile(
      user.id,
      folder,
      label,
      file,
    );
    return {
      success: true,
      message: 'File Upload Successfull',
      data,
    };
  }

  @Get(':id')
  async getFile(@Param('id') fileId: string) {
    const data = await this.fileService.getFile(fileId);
    return {
      success: true,
      message: 'File fetched successfully',
      data,
    };
  }
}
