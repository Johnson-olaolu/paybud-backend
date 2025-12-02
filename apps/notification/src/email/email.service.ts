/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MailerService } from '@nestjs-modules/mailer';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.config';
import {
  SendClientEmailDto,
  SendEmailDto,
  SendVendorEmailDto,
} from './dto/send-email.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '@app/shared/types/vendor';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name);
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(RABBITMQ_QUEUES.GATEWAY) private gatewayProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT) private clientProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
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

  async sendClientEmail(sendEmailDto: SendClientEmailDto): Promise<string> {
    const { clientId, subject, body } = sendEmailDto;
    try {
      const client = await lastValueFrom(
        this.clientProxy.send<User>('findOneUser', clientId),
      ).catch((error) => {
        throw new InternalServerErrorException(
          `Failed to fetch client ${clientId}: ${error?.message}`,
        );
      });

      await this.mailerService.sendMail({
        to: [client.email],
        subject,
        html: body,
      });

      const result = `Email sent to client ${clientId} at ${client.email} with subject: ${subject}`;
      this.logger.log(result);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to client ${clientId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to send email to client ${clientId}`,
      );
    }
  }

  async sendVendorEmail(sendEmailDto: SendVendorEmailDto): Promise<string> {
    const { businessId, roles, subject, body } = sendEmailDto;
    const users = await lastValueFrom(
      this.vendorProxy.send<User[]>('findUserByBusiness', {
        businessId,
        roles,
      }),
    ).catch(() => {
      throw new InternalServerErrorException('Could not end Email');
    });
    console.log({ users });
    try {
      const emails = users.map((user) => user.email);

      await this.mailerService.sendMail({
        to: emails,
        subject,
        html: body,
      });

      const result = `Email sent to business ${businessId} with emails ${emails.join(', ')} with subject: ${subject}`;
      this.logger.log(result);
      return result;
    } catch (error: any) {
      this.logger.error(
        `Failed to send email to vendor ${businessId}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to send email to vendot ${businessId}`,
      );
    }
  }
}
