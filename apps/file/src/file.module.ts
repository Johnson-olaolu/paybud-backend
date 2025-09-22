import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/file/.env',
    }),
    DatabaseModule,
    RabbitmqModule,
    TypeOrmModule.forFeature([File]),
    ServicesModule,
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
