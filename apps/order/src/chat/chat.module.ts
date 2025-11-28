import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderChat } from './entities/order-chat.entity';
import { OrderChatMessage } from './entities/order-chat-message.entity';
import { OrderChatService } from './chat.service';
import { OrderChatController } from './chat.controller';
import { RabbitmqModule } from '@app/rabbitmq';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderChat, OrderChatMessage]),
    RabbitmqModule,
    RabbitmqModule.register({ name: RABBITMQ_QUEUES.GATEWAY }),
  ],
  controllers: [OrderChatController],
  providers: [OrderChatService],
  exports: [OrderChatService],
})
export class OrderChatModule {}
