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

@Entity()
export class OrderChat extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.chat, { onDelete: 'CASCADE' })
  order: Relation<Order>;

  @Column()
  vendorId: string;

  @Column()
  clientId: string;

  @OneToMany(() => OrderChatMessage, (message) => message.chat)
  messages: Relation<OrderChatMessage>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
