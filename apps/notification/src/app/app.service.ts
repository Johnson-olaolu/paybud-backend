import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppNotification } from './entitities/app-notifications.entity';
import { Repository } from 'typeorm';
import {
  CreateAppNotificationBusinessDto,
  CreateAppNotificationDto,
} from './dto/create-app-notification.dto';
import { GetUserNotificationsDto } from './dto/get-user-notifications.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from 'apps/notification/types/vendor';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(AppNotification)
    private appNotificationRepository: Repository<AppNotification>,
    @Inject(RABBITMQ_QUEUES.GATEWAY) private gatewayProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
  ) {}

  async createNotification(createAppNotificationDto: CreateAppNotificationDto) {
    const notification = await this.appNotificationRepository.save(
      createAppNotificationDto,
    );
    const notifications = await this.getUserNotifications({
      userId: createAppNotificationDto.userId,
    });
    this.sendNotificationsToUser(notifications);
    if (createAppNotificationDto.popup) this.sendPopupToUser(notification);
    return notification;
  }

  async createNotificationToVendor(
    createAppNotificationBusinessDto: CreateAppNotificationBusinessDto,
  ) {
    const users = await lastValueFrom(
      this.vendorProxy.send<User[]>(
        'findUserByBusinessId',
        createAppNotificationBusinessDto.businessId,
      ),
    );
    for (const user of users) {
      const notification = await this.appNotificationRepository.save({
        ...createAppNotificationBusinessDto,
        userId: user.id,
        clientType: 'vendor',
      });
      const notifications = await this.getUserNotifications({
        userId: user.id,
      });
      this.sendNotificationsToUser(notifications);
      if (createAppNotificationBusinessDto.popup)
        this.sendPopupToUser(notification);
    }
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
    await notification.save();
    const notifications = await this.getUserNotifications({
      userId: notification.userId,
    });
    this.sendNotificationsToUser(notifications);
    return notification;
  }

  async markAllAsRead(userId: string) {
    await this.appNotificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    const notifications = await this.getUserNotifications({ userId });
    this.sendNotificationsToUser(notifications);
  }

  async deleteNotification(notificationId: string) {
    const notification = await this.appNotificationRepository.findOneBy({
      id: notificationId,
    });
    if (!notification) {
      throw new BadRequestException('Notification not found');
    }
    await notification.remove();
    const notifications = await this.getUserNotifications({
      userId: notification.userId,
    });
    this.sendNotificationsToUser(notifications);
    return notification;
  }

  async deleteAllNotifications(userId: string) {
    const notification = await this.appNotificationRepository.findOneBy({
      userId,
    });
    if (!notification) {
      throw new BadRequestException('No notifications found for user');
    }
    await this.appNotificationRepository.delete({ userId });
    if (notification.clientType === 'vendor') {
      this.gatewayProxy.emit('vendor.notifyUser', {
        userId: notification.userId,
        notifications: [],
      });
    } else if (notification.clientType === 'client') {
      this.gatewayProxy.emit('client.notifyUser', {
        userId: notification.userId,
        notifications: [],
      });
    }
  }

  sendNotificationsToUser(notifications: AppNotification[]) {
    if (notifications[0].clientType === 'vendor') {
      lastValueFrom(
        this.gatewayProxy.emit('vendor.notifyUser', {
          userId: notifications[0].userId,
          notifications,
        }),
      ).catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to notify vendor');
      });
    } else if (notifications[0].clientType === 'client') {
      lastValueFrom(
        this.gatewayProxy.emit('client.notifyUser', {
          userId: notifications[0].userId,
          notifications,
        }),
      ).catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to notify client');
      });
    }
  }

  sendPopupToUser(notification: AppNotification) {
    if (notification.clientType === 'vendor') {
      lastValueFrom(
        this.gatewayProxy.emit('vendor.popupNotification', {
          userId: notification.userId,
          notification,
        }),
      ).catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to popup vendor');
      });
    } else if (notification.clientType === 'client') {
      lastValueFrom(
        this.gatewayProxy.emit('client.popupNotification', {
          userId: notification.userId,
          notification,
        }),
      ).catch((err) => {
        console.error(err);
        throw new InternalServerErrorException('Failed to popup client');
      });
    }
  }
}
