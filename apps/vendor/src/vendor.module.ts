import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { RabbitmqModule } from '@app/rabbitmq';
import { DatabaseModule } from '@app/database';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables, validateEnv } from './config/env.config';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { BusinessModule } from './business/business.module';
import { SeedModule } from './seed/seed.module';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { ServicesModule } from './services/services.module';
import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { TransactionModule } from './transaction/transaction.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    UserModule,
    WalletModule,
    BusinessModule,
    SeedModule,
    ServicesModule,
    TransactionModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
