import { Exclude, instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../role/entities/role.entity';
import { isBcryptHash } from '@app/shared/utils/misc';
import { Business } from '../../business/entities/business.entity';
import { Profile } from './profile.entity';
import { RegistrationTypeEnum } from '../../utils /constants';

@Entity()
@Index(['email', 'isEmailVerified'])
@Check(
  `(registrationType = '${RegistrationTypeEnum.EMAIL}' AND password IS NOT NULL AND password <> '') OR (registrationType != '${RegistrationTypeEnum.EMAIL}')`,
)
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Business, (business) => business.users)
  @JoinColumn()
  business: Relation<Business>;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Relation<Profile>;

  @Column({
    unique: true,
  })
  @Index()
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({
    default: false,
  })
  isEmailVerified: boolean;

  @Column({
    default: RegistrationTypeEnum.EMAIL,
    type: 'text',
  })
  registrationType: RegistrationTypeEnum;

  @ManyToOne(() => Role)
  @JoinColumn()
  role: Relation<Role>;

  @Column()
  @Index()
  roleName: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      if (!isBcryptHash(this.password)) {
        this.password = await bcrypt.hash(this.password, 3); // You can adjust the salt rounds as needed
      }
    }
  }

  comparePasswords(password: string) {
    const result = bcrypt.compareSync(password, this.password);
    return result;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
