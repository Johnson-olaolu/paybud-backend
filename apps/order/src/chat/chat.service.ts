import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderChat } from './entities/order-chat.entity';
import { Repository } from 'typeorm';
import { OrderChatMessage } from './entities/order-chat-message.entity';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderChatService {
  constructor(
    @InjectRepository(OrderChat)
    private orderChatRepository: Repository<OrderChat>,
    @InjectRepository(OrderChatMessage)
    private orderChatMessage: Repository<OrderChatMessage>,
    @Inject(RABBITMQ_QUEUES.GATEWAY) private gatewayProxy: ClientProxy,
  ) {}

  async createChat(order: Order) {
    const orderChat = await this.orderChatRepository.save({
      order,
    });
    return orderChat;
  }

  async getChatByOrder(orderId: string) {
    const chat = await this.orderChatRepository.findOne({
      where: { order: { id: orderId } },
    });
    return chat;
  }
}
