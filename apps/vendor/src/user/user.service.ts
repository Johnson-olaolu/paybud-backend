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
import { ChangePasswordDto } from './dto/change-password.dto';

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
        profilePicture: createUserDto.profilePicture || generateAvatar(),
      });
      const savedProfile = await queryRunner.manager.save(profile);
      const role = await this.roleService.findOneByName('owner');
      const user = this.userRepository.create({
        ...createUserDto,
        profile: savedProfile,
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
    const payload = await this.jwtService
      .verifyAsync<{ email: string; sub: string }>(token)
      .catch(() => {
        throw new BadRequestException('Invalid or expired token');
      });
    const user = await this.findOne(payload.sub);
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }
    user.isEmailVerified = true;
    const body = generateEmailBody('welcome-email', {
      name: user.fullName || '',
    });
    this.notificationProxy.emit('sendEmail', {
      email: user.email,
      subject: 'Welcome to PayBud',
      body,
    });
    return user.save();
  }

  async generateForgotPasswordToken(email: string) {
    const user = await this.findOneByEmail(email);
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
      expiresIn: '30m',
    });
    const resetLink = `${this.configService.get(
      'FRONTEND_URL',
    )}/vendor/auth/reset-password?token=${token}`;
    const body = generateEmailBody('reset-password', {
      name: user.fullName || '',
      resetLink,
    });
    this.notificationProxy.emit('sendEmail', {
      email: user.email,
      subject: 'Reset your password',
      body,
    });
    return true;
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const payload = await this.jwtService
      .verifyAsync<{ email: string; sub: string }>(changePasswordDto.token)
      .catch(() => {
        throw new BadRequestException('Invalid or expired token');
      });
    const user = await this.findOne(payload.sub);
    user.password = changePasswordDto.password;
    await user.save();
    return user;
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
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'business'],
    });
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
    if (!user.comparePasswords(authenticateUserDto.password)) {
      return user;
    }
    throw new BadRequestException('Invalid credentials');
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    for (const key in updateUserDto) {
      if (updateUserDto[key] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        user[key] = updateUserDto[key];
      }
    }
    return await user.save();
  }

  async oAuthCreateUser(
    registrationType: RegistrationTypeEnum,
    createUserDto: CreateUserDto,
  ) {
    let user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      relations: ['profile', 'business'],
    });
    if (!user) {
      const profile = await this.profileRepository.save({
        profilePicture: createUserDto.profilePicture || generateAvatar(),
      });
      const role = await this.roleService.findOneByName('owner');
      user = this.userRepository.create({
        ...createUserDto,
        registrationType: registrationType,
        profile: profile,
        isEmailVerified: true,
        role,
        roleName: role.name,
      });
      const body = generateEmailBody('welcome-email', {
        name: user.fullName || '',
      });
      this.notificationProxy.emit('sendEmail', {
        email: user.email,
        subject: 'Welcome to PayBud',
        body,
      });
      return await this.userRepository.save(user);
    }
  }

  async remove(id: string) {
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new BadRequestException('User not found');
    }
    return true;
  }
}
