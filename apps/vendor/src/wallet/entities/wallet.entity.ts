import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';
import { WalletCurrencyEnum, WalletStatusEnum } from '../../utils /constants';
import { Business } from '../../business/entities/business.entity';
import { WalletVba } from './wallet-vba.entity';

@Entity()
@Index(['business', 'currency'], { unique: true })
export class Wallet extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Business, (business) => business.wallets)
  business: Relation<Business>;

  @Column({
    default: 0,
    type: 'money',
  })
  balance: number;

  @OneToMany(() => WalletVba, (vba) => vba.wallet)
  vbaAccounts: Relation<WalletVba>[];

  @OneToMany(() => WalletTransaction, (transaction) => transaction.wallet)
  transactions: Relation<WalletTransaction>[];

  @Column({
    type: 'text',
    default: WalletStatusEnum.ACTIVE,
  })
  status: WalletStatusEnum;

  @Column({
    type: 'text',
    default: WalletCurrencyEnum.NGN,
  })
  currency: WalletCurrencyEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
