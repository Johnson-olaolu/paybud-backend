/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GetUserNotificationsDto } from 'apps/notification/src/app/dto/get-user-notifications.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'vendor-notifications',
  transports: ['websocket'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly notificationService: NotificationService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.notificationService.bindServer(this.server);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token || client.handshake.auth.token;
    if (!token) {
      client.emit('error', { message: 'Authentication failed: Token missing' });
      client.disconnect(); // ❌ reject connection
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const { sub, tokenId } = payload as { sub: string; tokenId: string };
      const cachedTokens =
        (await this.cacheManager.get<string[]>(`tokens:${sub}`)) || [];
      if (!cachedTokens.includes(tokenId)) {
        throw new Error('Invalid token');
      }
      const user = await this.authService.getUser(sub);
      console.log(user);
      await client.join(`user:${sub}`);
      if (!user) {
        throw new Error('Invalid token');
      }
      (client as any).user = user;
    } catch {
      client.emit('error', { message: 'Authentication failed: Invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log((client as any).user);
    // cleanup if needed
  }

  @SubscribeMessage('notifications:load')
  loadNotifications(
    @MessageBody() data: GetUserNotificationsDto,
    // @ConnectedSocket() client: Socket,
  ) {
    this.notificationService.fetchUserNotifications(data);
  }

  @SubscribeMessage('notifications:read')
  readNotifications(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    this.notificationService.readNotification(data.userId, data.notificationId);
  }

  @SubscribeMessage('notifications:delete')
  deleteNotifications(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    this.notificationService.deleteNotification(
      data.userId,
      data.notificationId,
    );
  }

  async sendToUser(userId: string, notification: any) {
    const socketsInRoom = await this.server.in(`user:${userId}`).fetchSockets();
    console.log(`Sockets in room user:${userId}:`, socketsInRoom);
    console.log('Sending notification to user:', userId, notification);
    this.server.emit('notifications:load', notification);
  }
}
