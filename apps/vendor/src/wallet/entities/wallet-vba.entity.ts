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
import { Wallet } from './wallet.entity';

@Entity()
export class WalletVba extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Wallet, { nullable: false })
  wallet: Relation<Wallet>;

  @Column()
  vbaId: string;

  @Column()
  accountNumber: string;

  @Column()
  bankName: string;

  @Column()
  bankCode: string;

  @Column()
  accountName: string;

  @Column({ default: true })
  isDefault: boolean;

  @Column({ default: true })
  active: boolean;

  @Column()
  currency: string;

  @Column({
    type: 'json',
    default: {},
  })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
