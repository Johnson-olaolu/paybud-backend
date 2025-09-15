import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppNotification } from './entitities/app-notifications.entity';
import { Repository } from 'typeorm';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { GetUserNotificationsDto } from './dto/get-user-notifications.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppNotification)
    private appNotificationRepository: Repository<AppNotification>,
  ) {}

  async sendNotification(createAppNotificationDto: CreateAppNotificationDto) {
    const notification = await this.appNotificationRepository.save(
      createAppNotificationDto,
    );
    return notification;
  }

  async getUserNotifications(getUserNotificationsDto: GetUserNotificationsDto) {
    const { userId, isRead, limit = 10, cursor } = getUserNotificationsDto;
    const query = this.appNotificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', { isRead });
    }

    if (cursor) {
      query.andWhere('notification.createdAt < :cursor', { cursor });
    }

    const notifications = await query
      .orderBy('notification.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return notifications;
  }

  async markAsRead(notificationId: string) {
    const notification = await this.appNotificationRepository.findOneBy({
      id: notificationId,
    });
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    notification.isRead = true;
    return notification.save();
  }

  async markAllAsRead(userId: string) {
    await this.appNotificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: string) {
    const result = await this.appNotificationRepository.delete(notificationId);
    if (result.affected === 0) {
      throw new BadRequestException('Notification not found');
    }
  }

  async deleteAllNotifications(userId: string) {
    await this.appNotificationRepository.delete({ userId });
  }
}
