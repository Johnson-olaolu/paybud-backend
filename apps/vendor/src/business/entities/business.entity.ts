import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { User } from '../../user/entities/user.entity';
import { BusinessProfile } from './business-profile.entity';

interface PaystackDetails {
  customer: {
    email: string;
    integration: number;
    domain: string;
    customer_code: string;
    id: number;
    identified: boolean;
    identifications: null;
    createdAt: string;
    updatedAt: string;
  };
  recipient: {
    createdAt: string;
    updatedAt: string;
  };
}

interface KYC {
  type: 'nin' | 'bvn' | 'passport' | 'driver_license';
  value: string;
  status: 'pending' | 'verified' | 'rejected';
}

@Entity()
export class Business extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => User, { nullable: false })
  @JoinColumn()
  owner: Relation<User>;

  @OneToOne(() => BusinessProfile, { cascade: true })
  @JoinColumn()
  profile: Relation<BusinessProfile>;

  @OneToMany(() => User, (user) => user.business)
  users: Relation<User>[];

  @OneToMany(() => Wallet, (wallet) => wallet.business)
  wallets: Relation<Wallet>[];

  @Column({
    default: false,
  })
  isVerified: boolean;

  @Column({ unique: true, nullable: true })
  @Index()
  payStackCustomerCode: string;

  @Column({
    type: 'json',
    default: {},
  })
  payStackDetails: PaystackDetails;

  @Column({ type: 'json', default: {} })
  KYC: KYC;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
