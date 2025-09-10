/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.config';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name);
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<string> {
    const { email, subject, body } = sendEmailDto;
    try {
      await this.mailerService.sendMail({
        to: [email],
        subject,
        html: body,
      });
      const result = `Email sent to ${email} with subject: ${subject}`;
      this.logger.log(result);
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
