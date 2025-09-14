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

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
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
