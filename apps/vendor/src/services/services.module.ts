import { Global, Module } from '@nestjs/common';
import { PaystackModule } from './paystack/paystack.module';

@Global()
@Module({
  imports: [PaystackModule],
  providers: [],
  exports: [PaystackModule],
})
export class ServicesModule {}
