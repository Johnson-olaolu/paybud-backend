import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderChat } from './entities/order-chat.entity';
import { OrderChatMessage } from './entities/order-chat-message.entity';
import { OrderChatService } from './chat.service';
import { OrderChatController } from './chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderChat, OrderChatMessage])],
  controllers: [OrderChatController],
  providers: [OrderChatService],
  exports: [OrderChatService],
})
export class OrderChatModule {}
