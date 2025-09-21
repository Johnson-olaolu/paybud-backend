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
import { OrderChatMessage } from './entities/order-chat-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/vendor/.env',
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
    DatabaseModule,
    RabbitmqModule,
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.NOTIFICATION }),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderInvoice,
      OrderSnapshot,
      OrderReview,
      OrderChatMessage,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
