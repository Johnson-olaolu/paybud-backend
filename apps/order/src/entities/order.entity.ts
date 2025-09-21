import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OrderChatMessage } from './order-chat-message.entity';
import { OrderInvoice } from './order-invoice.entity';
import { OrderSnapshot } from './order-snapshot.entity';
import { OrderItem } from './order-item.entity';
import { BadRequestException } from '@nestjs/common';
import { OrderStatusEnum } from '../utils/constants';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  clientNumber: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column({ nullable: true })
  vendorId: string;

  @Column({ nullable: true })
  vendorNumber: string;

  @Column({ nullable: true })
  vendorEmail: string;

  @OneToMany(() => OrderChatMessage, (chatMessage) => chatMessage.order)
  messages: Relation<OrderChatMessage>[];

  @OneToMany(() => OrderInvoice, (invoice) => invoice.order)
  invoices: Relation<OrderInvoice>[];

  @OneToMany(() => OrderSnapshot, (snapshot) => snapshot.order)
  snapshots: Relation<Order>;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: Relation<OrderItem>;

  @Column({
    type: 'text',
    default: OrderStatusEnum.DRAFT,
  })
  status: OrderStatusEnum;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({
    type: 'money',
    default: 0,
  })
  amount: number;

  @Column({
    type: 'text',
    default: 'vendor',
  })
  feesToBePaidBy: 'client' | 'vendor';

  @Column({
    type: 'text',
    default: 'vendor',
  })
  createdBy: 'client' | 'vendor';

  @Column({
    type: 'json',
    default: {},
  })
  metadata: any;

  @BeforeInsert()
  @BeforeUpdate()
  validateClientInfo() {
    if (!this.clientEmail && !this.clientNumber && !this.clientId) {
      throw new BadRequestException('Please provide client details.');
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  validateVendorInfo() {
    if (!this.vendorEmail && !this.vendorNumber && !this.vendorId) {
      throw new BadRequestException('Please provide client details.');
    }
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
