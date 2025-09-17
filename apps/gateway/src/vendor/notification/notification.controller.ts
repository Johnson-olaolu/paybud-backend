import { Body, Controller, Inject, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { AppNotification } from 'apps/notification/src/app/entitities/app-notifications.entity';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ApiTags } from '@nestjs/swagger';
import { CreateAppNotificationDto } from './dto/create-app-notification.dto';
import { NotificationGateway } from './notification.gateway';

@ApiTags('Vendor Notifications')
@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private readonly notificationProxy: ClientProxy,
  ) {}

  @MessagePattern('vendor.notifyUser')
  notifyUser(
    @Payload() data: { userId: string; notifications: AppNotification[] },
  ) {
    this.notificationGateway.sendToUser(data.userId, data.notifications);
  }

  @MessagePattern('vendor.popupNotification')
  popupNotification(
    @Payload() data: { userId: string; notification: AppNotification },
  ) {
    this.notificationService.popupToUser(data.userId, data.notification);
  }

  @Post('test-notification')
  testNotification(@Body() createAppNotificationDto: CreateAppNotificationDto) {
    this.notificationProxy.emit('sendNotification', createAppNotificationDto);
    return { message: 'Notification sent' };
  }
}
