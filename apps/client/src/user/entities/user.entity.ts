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
