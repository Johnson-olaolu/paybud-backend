import { Exclude, instanceToPlain } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column()
  ownerId: string;

  @Column()
  ownerType: 'vendor' | 'client' | 'app' | 'other';

  @Column()
  fileName: string;

  @Column()
  mimeType: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3Key: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3ETag: string;

  @Column({ nullable: true })
  url: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  s3Bucket: string;

  @Column()
  folder: string;

  @Column({
    default: false,
  })
  isPublic: boolean;

  @Column()
  size: number;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'timestamptz', nullable: true })
  expirationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
