import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { Job } from 'bullmq';
import {
  SendClientEmailDto,
  SendEmailDto,
  SendVendorEmailDto,
} from './dto/send-email.dto';
import { JOB_NAMES } from '../utils/constants';

@Processor(JOB_NAMES.EMAIL)
export class EmailWorker extends WorkerHost {
  constructor(private emailService: EmailService) {
    super();
  }

  process(
    job: Job<
      any,
      any,
      'send-email-job' | 'send-vendor-email-job' | 'send-client-email-job'
    >,
  ): Promise<any> {
    switch (job.name) {
      case 'send-email-job':
        return this.emailService.sendEmail(job.data as SendEmailDto);
      case 'send-vendor-email-job':
        return this.emailService.sendVendorEmail(
          job.data as SendVendorEmailDto,
        );
      case 'send-client-email-job':
        return this.emailService.sendClientEmail(
          job.data as SendClientEmailDto,
        );
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
