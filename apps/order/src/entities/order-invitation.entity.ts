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
import {
  InvitationStatusEnum,
  OrderInviteMediumEnum,
} from '../utils/constants';

@Entity()
export class OrderInvitation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.invitations, { onDelete: 'CASCADE' })
  order: Relation<Order>;

  @Column()
  type: 'VENDOR' | 'CLIENT';

  @Column({
    type: 'text',
  })
  medium: OrderInviteMediumEnum;

  @Column({ nullable: true })
  vendorId: string;

  @Column({ nullable: true })
  vendorNumber: string;

  @Column({ nullable: true })
  vendorEmail: string;

  @Column({ nullable: true })
  clientId: string;

  @Column({ nullable: true })
  clientNumber: string;

  @Column({ nullable: true })
  clientEmail: string;

  @Column({
    type: 'text',
    default: InvitationStatusEnum.PENDING,
  })
  status: InvitationStatusEnum;

  @Column({ nullable: true, type: 'timestamptz' })
  respondedAt: Date;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
