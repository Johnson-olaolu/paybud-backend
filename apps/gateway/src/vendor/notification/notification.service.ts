import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Server } from 'socket.io';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { AppNotification } from '@app/shared/types/notification';

@Injectable()
export class NotificationService {
  private server: Server;
  private logger = new Logger(NotificationService.name);
  private rooms = new Set<string>();

  constructor(
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
  ) {}

  bindServer(server: Server) {
    this.server = server;
  }

  joinRoom(userId: string) {
    if (!this.server) {
      this.logger.warn('Socket server not bound yet');
      return;
    }
    if (this.rooms.has(userId)) {
      return; // already joined
    }
    this.server.socketsJoin(`user:${userId}`);
    this.rooms.add(userId);
  }

  emitToUser(userId: string, notifications: AppNotification[]) {
    if (!this.server) {
      this.logger.warn('Socket server not bound yet');
      return;
    }
    const success = this.server
      .to(`user:${userId}`)
      .emit('notifications:load', notifications || []);
    console.log(success);
  }

  fetchUserNotifications(data: GetNotificationsDto) {
    this.notificationProxy.emit<AppNotification[]>(
      'getUserNotifications',
      data,
    );
  }

  popupToUser(userId: string, notification: AppNotification) {
    if (!this.server) {
      this.logger.warn('Socket server not bound yet');
      return;
    }
    this.server.to(`user:${userId}`).emit('notifications:popup', notification);
  }

  readNotification(userId: string, notificationId: string) {
    this.notificationProxy.emit('readNotification', { userId, notificationId });
  }

  deleteNotification(userId: string, notificationId: string) {
    this.notificationProxy.emit('deleteNotification', {
      userId,
      notificationId,
    });
  }
}
