import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from './wallet.entity';
import {
  WalletTransactionActionEnum,
  WalletTransactionStatusEnum,
  WalletTransactionTypeEnum,
} from '../../utils /constants';

@Entity()
export class WalletTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    default: 0,
    type: 'money',
  })
  amount: number;

  @Column({ type: 'text' })
  action: WalletTransactionActionEnum;

  @Column({ type: 'text' })
  type: WalletTransactionTypeEnum;

  @Column()
  reference: string;

  @Column({
    type: 'text',
    default: WalletTransactionStatusEnum.PENDING,
  })
  status: WalletTransactionStatusEnum;

  @OneToMany(() => Wallet, (wallet) => wallet.transactions)
  wallet: Relation<Wallet>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
