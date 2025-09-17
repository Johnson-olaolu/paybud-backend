import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { GetUserNotificationsDto } from './dto/get-user-notifications.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils/constants';
import { Queue } from 'bullmq';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue(JOB_NAMES.APP) private appQueue: Queue,
  ) {}

  @MessagePattern('sendNotification')
  async createNotification(data: CreateAppNotificationDto) {
    await this.appQueue.add('sendNotification', data);
  }

  @MessagePattern('getUserNotifications')
  async getUserNotifications(data: GetUserNotificationsDto) {
    await this.appQueue.add('getUserNotifications', data);
  }

  @MessagePattern('markNotificationAsRead')
  async markAsRead(data: { notificationId: string }) {
    await this.appQueue.add('markNotificationAsRead', data);
  }

  @MessagePattern('markAllNotificationsAsRead')
  async markAllAsRead(data: { userId: string }) {
    await this.appQueue.add('markAllNotificationsAsRead', data);
  }

  @MessagePattern('deleteNotification')
  async deleteNotification(data: { notificationId: string }) {
    await this.appQueue.add('deleteNotification', data);
  }

  @MessagePattern('deleteAllNotifications')
  async deleteAllNotifications(data: { userId: string }) {
    await this.appQueue.add('deleteAllNotifications', data);
  }
}
