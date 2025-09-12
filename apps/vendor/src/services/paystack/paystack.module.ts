import { Module } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/env.config';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return {
          timeout: 5000,
          maxRedirects: 5,
          headers: {
            Authorization: `Bearer ${configService.get('PAYSTACK_SECRET_KEY')}`,
          },
          baseURL: configService.get('PAYSTACK_BASE_URL'),
        };
      },
    }),
  ],
  providers: [PaystackService],
  exports: [PaystackService],
})
export class PaystackModule {}
