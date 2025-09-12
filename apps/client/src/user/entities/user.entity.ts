import { BadRequestException } from '@nestjs/common';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

interface PaystackDetails {
  email: string;
  integration: number;
  domain: string;
  customer_code: string;
  id: number;
  identified: boolean;
  identifications: null;
  createdAt: string;
  updatedAt: string;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, nullable: true })
  email: string;

  @Index()
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ default: false })
  isRegistered: boolean;

  @Column({
    type: 'json',
    default: {},
  })
  payStackDetails: PaystackDetails;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateContactInfo() {
    if (!this.email && !this.phoneNumber) {
      throw new BadRequestException(
        'Either email or phone number must be provided.',
      );
    }
  }
}
