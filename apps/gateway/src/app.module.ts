import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorModule } from './vendor/vendor.module';
import { ClientModule } from './client/client.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqModule } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { EnvironmentVariables, validateEnv } from './config/env.config';
// import { BullBoardModule } from '@bull-board/nestjs';
// import { ExpressAdapter } from '@bull-board/express';
import { CacheModule } from '@nestjs/cache-manager';
import { ServicesModule } from './services/services.module';
import KeyvRedis from '@keyv/redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
// import basicAuth from 'express-basic-auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/gateway/.env',
    }),
    EventEmitterModule.forRoot(),
    VendorModule,
    ClientModule,
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.CLIENT }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.VENDOR }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.ORDER }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.NOTIFICATION }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return {
          stores: [
            new KeyvRedis(
              `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
              // `redis://${configService.get('REDIS_USERNAME')}:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
            ),
          ],
        };
      },
      isGlobal: true,
    }),
    CacheModule.register({ isGlobal: true }),
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
