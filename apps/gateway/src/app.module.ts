import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VendorModule } from './vendor/vendor.module';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';
import { RabbitmqModule } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { validateEnv } from './config/env.config';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/gateway/.env',
    }),
    VendorModule,
    ClientModule,
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.CLIENT }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.VENDOR }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.ORDER }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
