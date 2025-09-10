import { Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { Job } from 'bullmq';
import { SendEmailDto } from './dto/send-email.dto';
import { JOB_NAMES } from '../utils/constants';

@Processor(JOB_NAMES.EMAIL)
export class EmailWorker extends WorkerHost {
  constructor(private emailService: EmailService) {
    super();
  }

  process(job: Job<SendEmailDto>): Promise<any> {
    return this.emailService.sendEmail(job.data);
  }
}
