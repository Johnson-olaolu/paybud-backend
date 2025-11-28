import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import type { Order as OrderType } from '@app/shared/types/order';

@Entity()
export class OrderSnapshot extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.snapshots)
  order: Relation<Order>;

  @Column()
  name: string;

  @Column({
    type: 'json',
  })
  data: Omit<OrderType, 'id'>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
