/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { User } from './entities/user.entity';
import { generateAvatar, generateEmailBody } from '../utils /misc';
import { JwtService } from '@nestjs/jwt';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { RoleService } from './role/role.service';
import { EnvironmentVariables } from '../config/env.config';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { RegistrationTypeEnum } from '../utils /constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private roleService: RoleService,
    private dataSource: DataSource,
    private jwtService: JwtService,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const profile = this.profileRepository.create({
        profilePicture: generateAvatar(),
      });
      await queryRunner.manager.save(profile);
      const role = await this.roleService.findOneByName('owner');
      const user = this.userRepository.create({
        ...createUserDto,
        profile: profile,
        role: role,
        roleName: role.name,
      });
      const savedUser = await queryRunner.manager.save(user);
      await this.sendConfirmUserEmail(savedUser);
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error: any) {
      console.log(error);

      await queryRunner.rollbackTransaction();
      if (error?.code == '23505') {
        throw new BadRequestException(error.detail);
      }
      throw new InternalServerErrorException(error.detail);
    } finally {
      await queryRunner.release();
    }
  }

  async sendVerifyEmail(email: string) {
    const user = await this.findOneByEmail(email);
    const token = await this.cacheManager.get<string>(
      `email-verification-token-${user.id}`,
    );
    let verificationLink = '';
    if (token) {
      verificationLink = `${this.configService.get('FRONTEND_URL')}/vendor/auth/verify-email?token=${token}`;
    } else {
      const payload = { sub: user.id, email: user.email };
      const newToken = this.jwtService.sign(payload, {
        expiresIn: '30m',
      });
      verificationLink = `${this.configService.get('FRONTEND_URL')}/vendor/auth/verify-email?token=${newToken}`;
      await this.cacheManager.set(
        `email-verification-token-${user.id}`,
        newToken,
        1800,
      ); // 30 minutes
    }

    const body = generateEmailBody('verify-email', {
      name: user.fullName || '',
      verificationLink,
    });
    this.notificationProxy.emit('sendEmail', {
      email: user.email,
      subject: 'Confirm your email',
      body,
    });
    return user;
  }

  async sendConfirmUserEmail(user: User) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      expiresIn: '30m',
    });
    const verificationLink = `${this.configService.get('FRONTEND_URL')}/vendor/auth/verify-email?token=${token}`;
    await this.cacheManager.set(
      `email-verification-token-${user.id}`,
      token,
      1800,
    ); // 30 minutes
    const body = generateEmailBody('verify-email', {
      name: user.fullName || '',
      verificationLink,
    });
    this.notificationProxy.emit('sendEmail', {
      email: user.email,
      subject: 'Confirm your email',
      body,
    });
    return user;
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<{ email: string; sub: string }>(
        token,
      );
      const user = await this.findOne(payload.sub);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      if (user.isEmailVerified) {
        return { message: 'Email already verified' };
      }
      user.isEmailVerified = true;
      return user.save();
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['profile', 'business'],
    });
    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'business'],
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async authenticateUser(authenticateUserDto: AuthenticateUserDto) {
    const user = await this.findOneByEmail(authenticateUserDto.email);
    if (user.registrationType !== RegistrationTypeEnum.EMAIL) {
      throw new BadRequestException(
        `Please Login with Oauth : ${user.registrationType}`,
      );
    }
    if (user.comparePasswords(authenticateUserDto.password)) {
      return user;
    }
    throw new BadRequestException('Invalid credentials');
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new BadRequestException('User not found');
    }
    return true;
  }
}
