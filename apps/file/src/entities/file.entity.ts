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

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  s3ETag: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  s3Bucket: string;

  @Column()
  folder: string;

  @Column({
    default: false,
  })
  isPublic: boolean;

  @Column()
  size: number;

  @Column({ type: 'timestamptz', nullable: true })
  expirationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
