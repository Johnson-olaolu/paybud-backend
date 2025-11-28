import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  SendClientEmailDto,
  SendEmailDto,
  SendVendorEmailDto,
} from './dto/send-email.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { Queue } from 'bullmq';

@Controller()
export class EmailController {
  constructor(@InjectQueue(JOB_NAMES.EMAIL) private emailQueue: Queue) {}

  @MessagePattern('sendEmail')
  async sendEmail(@Payload() sendEmailDto: SendEmailDto) {
    await this.emailQueue.add('send-email-job', sendEmailDto, {
      removeOnComplete: true,
    });
    return {
      success: true,
      message: 'Email job added to the queue',
    };
  }

  @MessagePattern('sendVendorEmail')
  async sendVendorEmail(@Payload() sendEmailDto: SendVendorEmailDto) {
    await this.emailQueue.add('send-vendor-email-job', sendEmailDto, {
      removeOnComplete: true,
    });
    return {
      success: true,
      message: 'Vendor email job added to the queue',
    };
  }

  @MessagePattern('sendClientEmail')
  async sendClientEmail(@Payload() sendEmailDto: SendClientEmailDto) {
    await this.emailQueue.add('send-client-email-job', sendEmailDto, {
      removeOnComplete: true,
    });
    return {
      success: true,
      message: 'Client email job added to the queue',
    };
  }
}
