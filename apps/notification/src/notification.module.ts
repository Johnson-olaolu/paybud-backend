import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailModule } from './email/email.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AppModule } from './app/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.config';
import { BullModule } from '@nestjs/bullmq';
import { RabbitmqModule } from '@app/rabbitmq';
import { DatabaseModule } from '@app/database';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/notification/.env',
    }),
    EmailModule,
    WhatsappModule,
    AppModule,
    RabbitmqModule,
    RabbitmqModule.register({
      name: RABBITMQ_QUEUES.GATEWAY,
    }),
    RabbitmqModule.register({
      name: RABBITMQ_QUEUES.VENDOR,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD') ?? undefined,
          username: configService.get('REDIS_USERNAME') ?? undefined,
          maxRetriesPerRequest: null, // 🛠️ Prevents creating new clients when a request fails
          enableOfflineQueue: true, // 🚀 Allow queuing commands when the connection is down
          retryStrategy: (times) => Math.min(times * 50, 2000),
        },
        sharedConnection: true, // ✅ Use a single Redis connection for all queues
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
