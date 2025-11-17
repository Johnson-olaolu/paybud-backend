import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderChat } from './entities/order-chat.entity';
import { Repository } from 'typeorm';
import { OrderChatMessage } from './entities/order-chat-message.entity';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Order } from '../entities/order.entity';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { ClientUser } from '@app/shared/types/client';
import { Business } from '@app/shared/types/vendor';

@Injectable()
export class OrderChatService {
  constructor(
    @InjectRepository(OrderChat)
    private orderChatRepository: Repository<OrderChat>,
    @InjectRepository(OrderChatMessage)
    private orderChatMessageRepository: Repository<OrderChatMessage>,
    @Inject(RABBITMQ_QUEUES.GATEWAY) private gatewayProxy: ClientProxy,
  ) {}

  async createChat(order: Order, vendor: Business, client: ClientUser) {
    const orderChat = await this.orderChatRepository.save({
      order,
      clientProfile: client,
      vendorProfile: vendor,
    });
    return orderChat;
  }

  async getChatByOrder(orderId: string) {
    const chat = await this.orderChatRepository.findOne({
      where: { order: { id: orderId } },
      relations: {
        messages: true,
      },
    });
    if (!chat) {
      throw new BadRequestException('Chat Not found for this order');
    }
    return chat;
  }

  async findOne(id: string) {
    const chat = await this.orderChatRepository.findOne({
      where: { id },
      relations: {
        messages: true,
      },
    });
    if (!chat) {
      throw new BadRequestException('Chat Not found for this order');
    }
    return chat;
  }

  async sendMessage(
    chatId: string,
    createChatMessageDto: CreateChatMessageDto,
  ) {
    const chat = await this.findOne(chatId);
    const message = this.orderChatMessageRepository.create({
      chat,
      ...createChatMessageDto,
    });
    if (createChatMessageDto.replyToId) {
      const replyToMessage = await this.orderChatMessageRepository.findOne({
        where: { id: createChatMessageDto.replyToId },
      });
      if (replyToMessage) {
        message.replyTo = replyToMessage;
      }
    }
    return await message.save();
  }
}
