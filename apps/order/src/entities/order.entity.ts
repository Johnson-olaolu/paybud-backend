import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { OrderInvoice } from './order-invoice.entity';
import { OrderSnapshot } from './order-snapshot.entity';
import { OrderItem } from './order-item.entity';
import { BadRequestException } from '@nestjs/common';
import { OrderStatusEnum } from '../utils/constants';
import { OrderChat } from '../chat/entities/order-chat.entity';
import { OrderInvitation } from './order-invitation.entity';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  vendorId: string;

  @OneToOne(() => OrderChat, (chat) => chat.order)
  @JoinColumn()
  chat: Relation<OrderChat>;

  @OneToMany(() => OrderInvitation, (invitation) => invitation.order)
  invitations: Relation<OrderInvitation>[];

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
  validateInfo() {
    if (!this.vendorId && !this.clientId) {
      throw new BadRequestException('Please provide order details.');
    }
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
