import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NotificationTypeEnum } from '../../utils/constants';

@Entity()
export class AppNotification extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  message: string;

  @Column({
    type: 'text',
  })
  clientType: 'vendor' | 'client' | 'admin';

  @Column({
    type: 'text',
    default: NotificationTypeEnum.INFO,
  })
  type: NotificationTypeEnum;

  @Column()
  action: string;

  @Column({ default: false })
  popup: boolean;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
