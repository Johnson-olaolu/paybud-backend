import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessProfile } from './entities/business-profile.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils /constants';
import { BusinessWorker } from './business.worker';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessProfile]),
    BullModule.registerQueue({
      name: JOB_NAMES.CREATE_BUSINESS,
    }),
    UserModule,
    WalletModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessWorker],
  exports: [BusinessService],
})
export class BusinessModule {}
