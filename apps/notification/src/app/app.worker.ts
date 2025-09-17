import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { Job } from 'bullmq';
import { AppService } from './app.service';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { GetUserNotificationsDto } from './dto/get-user-notifications.dto';

@Processor(JOB_NAMES.APP)
export class AppNotificationWorker extends WorkerHost {
  constructor(private appNotificationService: AppService) {
    super();
  }

  async process(
    job: Job<
      | CreateAppNotificationDto
      | GetUserNotificationsDto
      | { notificationId: string }
      | { userId: string },
      { message: string },
      | 'createNotification'
      | 'getUserNotifications'
      | 'markNotificationAsRead'
      | 'markAllNotificationsAsRead'
      | 'deleteNotification'
      | 'deleteAllNotifications'
    >,
  ): Promise<any> {
    switch (job.name) {
      case 'createNotification':
        return await this.appNotificationService.createNotification(
          job.data as CreateAppNotificationDto,
        );
      case 'getUserNotifications': {
        const notifications =
          await this.appNotificationService.getUserNotifications(
            job.data as GetUserNotificationsDto,
          );
        return this.appNotificationService.sendNotificationsToUser(
          notifications,
        );
      }
      case 'markNotificationAsRead':
        return await this.appNotificationService.markAsRead(
          (job.data as { notificationId: string }).notificationId,
        );
      case 'markAllNotificationsAsRead':
        return await this.appNotificationService.markAllAsRead(
          (job.data as { userId: string }).userId,
        );
      case 'deleteNotification':
        return await this.appNotificationService.deleteNotification(
          (job.data as { notificationId: string }).notificationId,
        );
      case 'deleteAllNotifications':
        return await this.appNotificationService.deleteAllNotifications(
          (job.data as { userId: string }).userId,
        );
    }
    // return this.emailService.sendEmail(job.data);
  }
}
