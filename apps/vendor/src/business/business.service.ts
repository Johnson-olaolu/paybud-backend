import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { DataSource, Repository } from 'typeorm';
import { BusinessProfile } from './entities/business-profile.entity';
import { UserService } from '../user/user.service';
import { generateLogo } from '../utils /misc';
import { WalletService } from '../wallet/wallet.service';
import { PaystackService } from '../services/paystack/paystack.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userService.findOne(createBusinessDto.userId);
      const wallet = await this.walletService.create({});
      const businessProfile = this.businessProfileRepository.create({
        logo: generateLogo(createBusinessDto.name),
        address: createBusinessDto.address,
        contactPhoneNumber: createBusinessDto.contactPhoneNumber,
        contactEmail: createBusinessDto.contactEmail,
        description: createBusinessDto.description,
      });
      const paystackCustomer = await this.paystackService.createCustomer(
        user.email,
        user.fullName,
        createBusinessDto.name,
        createBusinessDto.contactPhoneNumber,
      );
      const savedBusinessProfile =
        await queryRunner.manager.save(businessProfile);
      const business = this.businessRepository.create({
        name: createBusinessDto.name,
        profile: savedBusinessProfile,
        users: [user],
        wallets: [wallet],
        payStackDetails: paystackCustomer.data,
      });
      const savedBusiness = await queryRunner.manager.save(business);
      await queryRunner.commitTransaction();
      return savedBusiness;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create business');
    } finally {
      await queryRunner.release();
    }
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
