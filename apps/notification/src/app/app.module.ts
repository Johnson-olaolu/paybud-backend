import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppNotification } from './entitities/app-notifications.entity';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { AppNotificationWorker } from './app.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppNotification]),
    BullModule.registerQueue({
      name: JOB_NAMES.APP,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppNotificationWorker],
})
export class AppModule {}
