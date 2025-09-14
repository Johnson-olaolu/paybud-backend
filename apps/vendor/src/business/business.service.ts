import {
  BadRequestException,
  Inject,
  Injectable,
  // InternalServerErrorException,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { Repository } from 'typeorm';
import { BusinessProfile } from './entities/business-profile.entity';
import { Queue } from 'bullmq';
import { JOB_NAMES } from '../utils /constants';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    @InjectQueue(JOB_NAMES.CREATE_BUSINESS)
    private businessQueue: Queue,
    @Inject(RABBITMQ_QUEUES.GATEWAY) private gatewayProxy: ClientProxy,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const jobKey = `initiate_business_registration:${createBusinessDto.userId}`;
    const existingJob = await this.businessQueue.getJob(jobKey);
    if (existingJob) {
      throw new BadRequestException(
        'A business registration is already in progress for this user.',
      );
    }
    await this.businessQueue.add(
      'initiate_business_registration',
      createBusinessDto,
      { jobId: jobKey, removeOnComplete: true, removeOnFail: false },
    );
    return { message: 'Business registration initiated' };
  }

  @OnEvent('business_validation.failed')
  async businessValidationFailed(payload: {
    customerCode: string;
    reason: string;
  }) {
    const { customerCode, reason } = payload;
    console.log(`Business validation failed for ${customerCode}: ${reason}`);
    const business = await this.businessRepository.findOne({
      where: { payStackCustomerCode: customerCode },
      relations: { owner: true },
    });
    if (!business) {
      throw new BadRequestException('Business not found');
    }
    await business?.remove();
    this.gatewayProxy.emit('businessVerification', {
      ownerId: business.owner.id,
      success: false,
      message: `Business verification failed: ${reason}`,
    });
    return true;
  }

  @OnEvent('business_validation.succeeded')
  async businessValidationSucceeded(payload: { customerCode: string }) {
    const { customerCode } = payload;
    console.log(`Business validation succeeded for ${customerCode}`);
    const business = await this.businessRepository.findOne({
      where: { payStackCustomerCode: customerCode },
      relations: { owner: true },
    });
    if (!business) {
      throw new BadRequestException('Business not found');
    }
    business.isVerified = true;
    await business.save();
    this.gatewayProxy.emit('businessVerification', {
      ownerId: business.owner.id,
      success: true,
      message: 'Business verified successfully',
    });
    return true;
  }

  async findAll() {
    const businesses = await this.businessRepository.find({
      relations: {
        profile: true,
        wallets: true,
      },
      relationLoadStrategy: 'query',
    });
    return businesses;
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: {
        profile: true,
        wallets: true,
      },
      relationLoadStrategy: 'query',
    });
    if (!business) {
      throw new BadRequestException('Business not found');
    }
    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await this.findOne(id);
    for (const key in updateBusinessDto) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      business[key] = updateBusinessDto[key];
    }
    await business.save();
    return business;
  }

  async remove(id: string) {
    const result = await this.businessRepository.softDelete(id);
    if (result.affected == 0) {
      throw new BadRequestException('Business not found');
    }
    return true;
  }
}
