import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessProfile } from './entities/business-profile.entity';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Business, BusinessProfile]),
    UserModule,
    WalletModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
