import {
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Business } from './business.entity';
import { fetchFileById } from '@app/shared/utils/misc';
import { File } from '@app/shared/types/file';

@Entity()
export class BusinessProfile extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Business)
  business: Relation<Business>;

  @Column({ nullable: true })
  logoId: string;

  @Column({ nullable: true })
  logoUrl: string;

  logo?: File;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contactPhoneNumber: string;

  @Column({ nullable: true })
  contactEmail: string;

  @AfterLoad()
  async getLogoUrl() {
    if (this.logoId) this.logo = await fetchFileById(this.logoId);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
