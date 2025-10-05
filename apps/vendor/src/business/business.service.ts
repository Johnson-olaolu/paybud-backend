import {
  BadRequestException,
  // Inject,
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
// import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
// import { ClientProxy } from '@nestjs/microservices';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { ValidateBusinessDto } from './dto/validate-business.dto';
import { GetBusinessByEmailOrPhoneDTO } from './dto/get-business.dto';
import { PaystackService } from '../services/paystack/paystack.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    @InjectQueue(JOB_NAMES.CREATE_BUSINESS)
    private businessQueue: Queue,
    private payStackService: PaystackService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const jobKey = `initiate_business_registration:${createBusinessDto.userId}`;
    await this.businessQueue
      .add('initiate_business_registration', createBusinessDto, {
        jobId: jobKey,
        removeOnComplete: false,
        removeOnFail: true,
      })
      .catch((error) => {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (error?.message as string) || 'Failed to queue job',
        );
      });
    return { message: 'Business registration initiated' };
  }

  @OnEvent('business_validation.failed')
  async businessValidationFailed(payload: {
    customerCode: string;
    reason: string;
  }) {
    const { customerCode, reason } = payload;
    const jobKey = `complete_business_registration:${customerCode}`;
    await this.businessQueue
      .add(
        'validate-business',
        {
          customerCode,
          message: 'Business verification failed: ' + reason,
          success: false,
        } as ValidateBusinessDto,
        {
          jobId: jobKey,
        },
      )
      .catch((error) => {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (error?.message as string) || 'Failed to queue job',
        );
      });
    return true;
  }

  @OnEvent('business_validation.succeeded')
  async businessValidationSucceeded(payload: { customerCode: string }) {
    const { customerCode } = payload;
    const jobKey = `complete_business_registration:${customerCode}`;
    await this.businessQueue
      .add(
        'validate-business',
        {
          customerCode,
          message: 'Business verified successfully',
          success: true,
        } as ValidateBusinessDto,
        {
          jobId: jobKey,
        },
      )
      .catch((error) => {
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (error?.message as string) || 'Failed to queue job',
        );
      });
    return true;
  }

  async findAll() {
    const businesses = await this.businessRepository.find({
      relations: {
        owner: true,
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
        owner: true,
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

  async findByEmailOrPhone(dto: GetBusinessByEmailOrPhoneDTO) {
    const business = await this.businessRepository.findOne({
      where: [{ businessEmail: dto.email }, { businessPhone: dto.phoneNumber }],
      relations: {
        owner: true,
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

  async fetchBanks() {
    const res = await this.payStackService.fetchBanks();
    return res.data;
  }
}
