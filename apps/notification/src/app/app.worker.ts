import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { Job } from 'bullmq';
import { AppService } from './app.service';

@Processor(JOB_NAMES.APP)
export class AppNotificationWorker extends WorkerHost {
  constructor(private appNotificationService: AppService) {
    super();
  }

  process(job: Job<any>): Promise<any> {
    // return this.emailService.sendEmail(job.data);
  }
}
