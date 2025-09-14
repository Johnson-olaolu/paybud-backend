import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { BusinessValidationController } from './business-validation.controller';

@Module({
  controllers: [BusinessController, BusinessValidationController],
  providers: [BusinessService],
})
export class BusinessModule {}
