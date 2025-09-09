import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { RabbitmqModule } from '@app/rabbitmq';
import { DatabaseModule } from '@app/database';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.config';
import { UserModule } from './user/user.module';
import { WalletModule } from './wallet/wallet.module';
import { BusinessModule } from './business/business.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/vendor/.env',
    }),
    DatabaseModule,
    RabbitmqModule,
    UserModule,
    WalletModule,
    BusinessModule,
    AuthModule,
    SeedModule,
  ],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
