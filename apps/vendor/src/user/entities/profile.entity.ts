import {
  AfterLoad,
  Column,
  // Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { File } from '@app/shared/types/file';
import { fetchFileById } from '@app/shared/utils/misc';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  profilePicture: File;

  @Column({ nullable: true })
  profilePictureId: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhoneNumber: string;

  @Column({ nullable: true })
  sex: string;

  @Column({ nullable: true })
  bio: string;

  @OneToOne(() => User, (user) => user.profile)
  user: Relation<User>;

  @AfterLoad()
  async getLogoUrl() {
    if (this.profilePictureId)
      this.profilePicture = await fetchFileById(this.profilePictureId);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
