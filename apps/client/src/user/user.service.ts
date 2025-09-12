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
import { EnvironmentVariables } from '../config/env.config';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { PaystackService } from '../services/paystack/paystack.service';

//  ${header({title: 'Gift Card Purchase Successful', username: `👋`})}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
    private configService: ConfigService<EnvironmentVariables>,
    private paystackService: PaystackService,
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
    await this.cacheManager.set(
      key,
      tokenHash,
      ms(this.configService.get<StringValue>('PASSWORD_EXPIRATION_TIME')!),
    );
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
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.findOne(createUserDto.userId);
    if (user.isRegistered) {
      throw new BadRequestException('User already registered');
    }
    user.fullName = createUserDto.fullName;
    user.userName = createUserDto.userName;
    user.phoneNumber = createUserDto.phoneNumber;
    user.profileImage = createUserDto.avatarUrl;
    const payStackDetails = await this.paystackService.createCustomer(
      user.email,
      user.fullName.split(' ')[0] || ' ',
      user.fullName.split(' ')[1] || ' ',
      user.phoneNumber,
    );
    user.payStackDetails = payStackDetails.data;
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

    return user.save();
  }

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
