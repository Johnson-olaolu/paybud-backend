import { Global, Module } from '@nestjs/common';
import { PaystackModule } from './paystack/paystack.module';
import { BusinessModule } from '../business/business.module';

@Global()
@Module({
  imports: [PaystackModule, BusinessModule],
  providers: [],
  exports: [PaystackModule],
})
export class ServicesModule {}
