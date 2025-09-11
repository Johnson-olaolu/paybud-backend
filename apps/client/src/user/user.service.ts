import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as otpGenerator from 'otp-generator';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { generateEmailBody } from '../utils/misc';

//  ${header({title: 'Gift Card Purchase Successful', username: `👋`})}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
  ) {}

  async emailGetToken(email: string) {
    let user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      user = await this.userRepository.save({ email });
    }
    const token = otpGenerator.generate(8, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const tokenHash = await bcrypt.hash(token, 3);
    const key = `client:${user.id}:email_token`;
    console.log({ key, token, tokenHash });
    await this.cacheManager.set(key, tokenHash, 1800); // 30 minutes in seconds
    const body = generateEmailBody('login-token', {
      name: user.fullName || '👋',
      token,
    });
    this.notificationProxy.emit('sendEmail', {
      email: user.email,
      subject: 'Your Login Token',
      body,
    });
  }

  async loginWithEmail(email: string, token: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const key = `client:${user.id}:email_token`;
    const tokenHash = await this.cacheManager.get<string>(key);
    console.log({ key });
    if (!tokenHash) {
      throw new BadRequestException('Token expired');
    }
    const isTokenValid = await bcrypt.compare(token, tokenHash);
    if (!isTokenValid) {
      throw new BadRequestException('Invalid token');
    }
    await this.cacheManager.del(key);
    if (!user.isRegistered) {
      user.isRegistered = true;
      const body = generateEmailBody('first-time-user', {
        name: user.fullName || '👋',
        helpCenterUrl: 'https://paybud.com/help-center',
      });
      this.notificationProxy.emit('sendEmail', {
        email: user.email,
        subject: 'Welcome to PayBud!',
        body,
      });
      await user.save();
    }
    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
