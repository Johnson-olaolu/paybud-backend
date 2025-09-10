import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessProfile } from './entities/business-profile';

@Module({
  imports: [TypeOrmModule.forFeature([Business, BusinessProfile])],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
