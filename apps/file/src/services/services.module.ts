import { Global, Module } from '@nestjs/common';
import { S3Service } from './aws/s3.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [S3Service],
  exports: [S3Service],
})
export class ServicesModule {}
