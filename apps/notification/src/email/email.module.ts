import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { EmailWorker } from './email.worker';
// import { EnvironmentVariables } from '../config/env.config';
// import * as sesClientModule from '@aws-sdk/client-ses';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        // const ses = new sesClientModule.SES({
        //   region: configService.get('AWS_REGION'),
        //   credentials: {
        //     accessKeyId: configService.get('MAIL_USERNAME')!,
        //     secretAccessKey: configService.get('MAIL_PASSWORD')!,
        //   },
        // });
        return {
          // transport: {
          //   SES: { ses, aws: sesClientModule },
          // },
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
              user: configService.get('EMAIL_USER'),
              pass: configService.get('EMAIL_PASSWORD'),
            },
          },
          defaults: {
            from: `${configService.get('MAIL_FROM')}`,
          },
        };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: JOB_NAMES.EMAIL,
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailWorker],
})
export class EmailModule {}
