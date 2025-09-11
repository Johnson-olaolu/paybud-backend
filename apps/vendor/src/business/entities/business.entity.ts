import {
  BaseEntity,
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
import { Wallet } from '../../wallet/entities/wallet.entity';
import { User } from '../../user/entities/user.entity';
import { BusinessProfile } from './business-profile.entity';

@Entity()
export class Business extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToOne(() => BusinessProfile, { cascade: true })
  @JoinColumn()
  profile: Relation<BusinessProfile>;

  @OneToMany(() => User, (user) => user.business)
  users: Relation<User>[];

  @OneToMany(() => Wallet, (wallet) => wallet.business)
  wallets: Relation<Wallet>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
