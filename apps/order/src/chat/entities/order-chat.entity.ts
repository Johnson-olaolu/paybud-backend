import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderChatMessage } from './order-chat-message.entity';
import type { User } from '@app/shared/types/vendor';
import type { ClientUser } from '@app/shared/types/client';

@Entity()
export class OrderChat extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.chat, { onDelete: 'CASCADE' })
  order: Relation<Order>;

  @Column({
    type: 'simple-json',
  })
  vendorProfile: User;

  @Column({
    type: 'simple-json',
  })
  clientProfile: ClientUser;

  @OneToMany(() => OrderChatMessage, (message) => message.chat)
  messages: Relation<OrderChatMessage>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
