import { WebSocketGateway } from '@nestjs/websockets';
import { NotificationService } from './notification.service';

@WebSocketGateway(80, {
  cors: true,
  namespace: 'notifications',
  transports: ['websocket'],
})
export class NotificationGateway {
  constructor(private readonly notificationService: NotificationService) {}
}
