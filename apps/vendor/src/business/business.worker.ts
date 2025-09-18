import { Processor, WorkerHost } from '@nestjs/bullmq';
import { JOB_NAMES } from '../utils /constants';
import { Job } from 'bullmq';
import { CreateBusinessDto } from './dto/create-business.dto';
import { PaystackService } from '../services/paystack/paystack.service';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BusinessProfile } from './entities/business-profile.entity';
import { Business } from './entities/business.entity';
import { WalletService } from '../wallet/wallet.service';
import {
  generateEmailBody,
  generateLogo,
  getNamesFromFullName,
} from '../utils /misc';
import { ValidateBusinessDto } from './dto/validate-business.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  SendAppNotificationDto,
  SendEmailNotificationDto,
} from '@app/shared/dto/notification.dto';
// import { Inject } from '@nestjs/common';
// import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
// import { ClientProxy } from '@nestjs/microservices';

@Processor(JOB_NAMES.CREATE_BUSINESS)
export class BusinessWorker extends WorkerHost {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(BusinessProfile)
    private readonly businessProfileRepository: Repository<BusinessProfile>,
    private readonly dataSource: DataSource,
    private readonly walletService: WalletService,
    private readonly paystackService: PaystackService,
    private readonly userService: UserService,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
  ) {
    super();
  }
  async process(
    job: Job<
      CreateBusinessDto | ValidateBusinessDto,
      { message: string },
      'initiate_business_registration' | 'validate-business'
    >,
  ) {
    // Process the job here
    switch (job.name) {
      case 'initiate_business_registration': {
        // Start Transaction
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const data = job.data as CreateBusinessDto;
        const user = await this.userService.findOne(data.userId);
        console.log({ user });
        try {
          // Create business and business profile

          const businessProfile = this.businessProfileRepository.create({
            logo: generateLogo(data.name),
            address: data.address,
            contactPhoneNumber: data.contactPhoneNumber,
            contactEmail: data.contactEmail,
            description: data.description,
          });
          const savedBusinessProfile =
            await queryRunner.manager.save(businessProfile);

          const business = this.businessRepository.create({
            name: data.name,
            owner: user,
            users: [user],
            profile: savedBusinessProfile,
          });
          const savedBusiness = await queryRunner.manager.save(business);

          // Create pastack customer and recipient
          const [customerData, recipientData] = await Promise.all([
            this.paystackService.createCustomer({
              email: user.email,
              firstName: user.fullName,
              lastName: data.name,
              phoneNumber: data.contactPhoneNumber,
              metadata: {
                userId: data.userId,
                businessName: savedBusiness.name,
                businessId: savedBusiness.id,
                businessAddress: data.address,
                businessDescription: data.description,
                contactEmail: data.contactEmail,
                contactPhoneNumber: data.contactPhoneNumber,
                bvn: data.businessBVN,
              },
            }),
            this.paystackService.createRecipient({
              accountNumber: data.businessAccountNumber,
              bankCode: data.businessBankCode,
              name: data.businessAccountName,
              metadata: {
                userId: data.userId,
                businessName: savedBusiness.name,
                businessId: savedBusiness.id,
                businessAddress: data.address,
                businessDescription: data.description,
                contactEmail: data.contactEmail,
                contactPhoneNumber: data.contactPhoneNumber,
              },
            }),
          ]);
          //Attach paystack details to business
          savedBusiness.payStackCustomerCode = customerData.data.customer_code;
          savedBusiness.payStackDetails = {
            customer: customerData.data,
            recipient: recipientData.data,
          };
          //validate customer
          const { firstName, middleName, lastName } = getNamesFromFullName(
            data.businessAccountName,
          );
          await this.paystackService.validateCostumer(
            customerData.data.customer_code,
            {
              account_number: data.businessAccountNumber,
              bvn: data.businessBVN,
              bankCode: data.businessBankCode,
              firstName,
              lastName,
              middleName,
            },
          );
          await queryRunner.manager.save(savedBusiness);
          await queryRunner.commitTransaction();
          return { message: 'Business registration initiated' };
        } catch (error) {
          this.notificationProxy.emit<boolean, SendAppNotificationDto>(
            'sendNotification',
            {
              userId: data.userId,
              message: `Your business ${data.name} registration failed. Please try again.`,
              action: 'business-registration:failed',
              clientType: 'vendor',
              type: 'error',
              popup: true,
            },
          );
          console.log(error);
          await queryRunner.rollbackTransaction();
          throw new Error('Failed to initiate business registration');
        }
        // break;
      }
      case 'validate-business': {
        const data = job.data as ValidateBusinessDto;
        const business = await this.businessRepository.findOne({
          where: { payStackCustomerCode: data.customerCode },
          relations: { owner: true },
        });
        if (!business) {
          throw new Error('Business not found');
        }
        if (!data.success) {
          await business?.remove();
          this.notificationProxy.emit<boolean, SendAppNotificationDto>(
            'sendNotification',
            {
              userId: business.owner.id,
              message: `Your business ${business.name} registration failed. Please try again.`,
              action: 'business-registration:failed',
              clientType: 'vendor',
              type: 'error',
              popup: true,
            },
          );
        } else {
          const queryRunner = this.dataSource.createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();
          try {
            const customerDetails = await this.paystackService.getCustomer(
              data.customerCode,
            );
            business.KYC = {
              type: 'bvn',
              value: customerDetails.data.metadata.bvn as string,
              status: 'verified',
            };
            business.isVerified = true;
            const wallet = await this.walletService.create({
              paystackCustomerCode: business.payStackCustomerCode,
              firstName: customerDetails.data.first_name as string,
              lastName: customerDetails.data.last_name as string,
            });
            business.wallets = [wallet];
            console.log({ business });
            await queryRunner.manager.save(business);
            await queryRunner.commitTransaction();
            // this.gatewayProxy.emit('businessVerification', {
            //   ownerId: business.owner.id,
            //   success: true,
            //   message: 'Business verified successfully',
            // });
            this.notificationProxy.emit<boolean, SendAppNotificationDto>(
              'sendNotification',
              {
                userId: business.owner.id,
                message: `Your business ${business.name} has been registered successfully`,
                action: 'business-registration:success',
                clientType: 'vendor',
                type: 'success',
                popup: true,
              },
            );
            this.notificationProxy.emit<boolean, SendEmailNotificationDto>(
              'sendEmail',
              {
                email: business.owner.email,
                subject: 'Business Registration Successful',
                body: generateEmailBody('business-created', {
                  name: business.owner.fullName || '',
                  businessName: business.name,
                }),
              },
            );
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        }
        return { message: 'Business validated successfully' };
      }
    }
  }
}
