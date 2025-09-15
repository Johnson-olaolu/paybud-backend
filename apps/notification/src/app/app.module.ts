import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppNotification } from './entitities/app-notifications.entity';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppNotification]),
    BullModule.registerQueue({
      name: JOB_NAMES.APP,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
