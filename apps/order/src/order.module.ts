import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DatabaseModule } from '@app/database';
import { RabbitmqModule } from '@app/rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables, validateEnv } from './config/env.config';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderInvoice } from './entities/order-invoice.entity';
import { OrderSnapshot } from './entities/order-snapshot.entity';
import { OrderReview } from './entities/order-review.entity';
import { OrderChatModule } from './chat/chat.module';
import { OrderInvitationService } from './services/order-invitation.service';
import { OrderItemService } from './services/order-item.service';
import { OrderInvitation } from './entities/order-invitation.entity';
import { ORDER_JOB_NAMES } from './utils/constants';
import { OrderInvitationWorker } from './workers/order-invitation.worker';
import { OrderStatusWorker } from './workers/order-status.worker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/order/.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.get('JWT_SECRET_KEY'),
      }),
      global: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return {
          stores: [
            new KeyvRedis(
              // `redis://${configService.get('REDIS_USERNAME')}:${configService.get('REDIS_PASSWORD')}@${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
              `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
            ),
          ],
        };
      },
      isGlobal: true,
    }),
    BullModule.forRootAsync({
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
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: ORDER_JOB_NAMES.ORDER_INVITATIONS,
    }),
    BullModule.registerQueue({
      name: ORDER_JOB_NAMES.PROCESS_ORDER_STATUS_CHANGE,
    }),
    DatabaseModule,
    RabbitmqModule,
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.NOTIFICATION }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.VENDOR }),
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.CLIENT }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderInvoice,
      OrderSnapshot,
      OrderReview,
      OrderChatModule,
      OrderInvitation,
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderInvitationService,
    OrderItemService,
    OrderInvitationWorker,
    OrderStatusWorker,
  ],
})
export class OrderModule {}
