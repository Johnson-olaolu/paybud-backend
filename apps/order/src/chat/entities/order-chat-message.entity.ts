import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OrderChat } from './order-chat.entity';
import { MessageTypeEnum } from '../../utils/constants';

interface BidDetails {
  amount: number;
  currency: string;
}

@Entity()
export class OrderChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderChat, (chat) => chat.messages)
  chat: Relation<OrderChat>;

  @Column()
  senderId: string;

  @Column()
  message: string;

  @Column({
    type: 'text',
    default: MessageTypeEnum.TEXT,
  })
  type: MessageTypeEnum;

  @Column({
    default: false,
  })
  isRead: boolean;

  @Column({
    nullable: true,
    type: 'json',
  })
  bidDetails: BidDetails;

  @OneToOne(() => OrderChatMessage)
  @JoinColumn()
  replyTo: Relation<OrderChatMessage>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
