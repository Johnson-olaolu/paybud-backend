/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { PaystackService } from './paystack.service';
import * as crypto from 'crypto';
import { EnvironmentVariables } from '../../config/env.config';
import { ConfigService } from '@nestjs/config';

@Controller('paystack')
export class PaystackController {
  constructor(
    private readonly paystackService: PaystackService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello from Paystack Controller';
  }

  @HttpCode(200)
  @Post('callback')
  handleCallback(@Body() payload: any) {
    const hash = crypto
      .createHmac('sha512', this.configService.get('PAYSTACK_SECRET_KEY')!)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (hash !== payload.signature) {
      throw new BadRequestException('Invalid signature');
    }
    switch (payload.event) {
      case 'customeridentification.failed':
        this.paystackService.handleCustomerIdentificationFailed(payload.data);
        break;
      case 'customeridentification.success':
        this.paystackService.handleCustomerIdentificationSuccess(payload.data);
        break;
    }
    return { message: 'Callback received' };
  }
}
