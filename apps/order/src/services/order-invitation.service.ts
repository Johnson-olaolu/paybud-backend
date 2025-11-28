/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderInvitation } from '../entities/order-invitation.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { InviteDetailsDto } from '../dto/create-order.dto';
import {
  InvitationStatusEnum,
  ORDER_JOB_NAMES,
  OrderInviteMediumEnum,
} from '../utils/constants';
import { Order } from '../entities/order.entity';
import { Business } from '@app/shared/types/vendor';
import { lastValueFrom } from 'rxjs';
import { ClientUser } from '@app/shared/types/client';
import { addDays } from 'date-fns';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  SendClientAppNotificationDto,
  SendVendorAppNotificationDto,
} from '@app/shared/dto/notification.dto';
import { generateEmailBody } from '../utils/misc';

@Injectable()
export class OrderInvitationService implements OnModuleInit {
  constructor(
    @InjectRepository(OrderInvitation)
    private orderInvitationRepository: Repository<OrderInvitation>,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.VENDOR)
    private vendorProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT)
    private clientProxy: ClientProxy,
    private dataSource: DataSource,
    @InjectQueue(ORDER_JOB_NAMES.ORDER_INVITATIONS)
    private orderInvitationQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.orderInvitationQueue.add(
      'expire-invitations',
      {},
      { repeat: { pattern: '0 * * * *' } }, // every hour
    );
  }

  async inviteClient(
    order: Order,
    vendor: Business,
    invitationDetails: InviteDetailsDto,
    queryRunner: QueryRunner,
  ) {
    try {
      const invitation = this.orderInvitationRepository.create({
        order,
        expiresAt: addDays(new Date(), 7),
        type: 'CLIENT',
        medium: invitationDetails.medium,
      });
      if (invitationDetails.medium === OrderInviteMediumEnum.EMAIL) {
        invitation.clientEmail = invitationDetails.email;
      }
      if (invitationDetails.medium === OrderInviteMediumEnum.PHONE) {
        invitation.clientNumber = invitationDetails.phoneNumber;
      }
      const savedInvitation = await queryRunner.manager.save(invitation);
      const client = await lastValueFrom(
        this.clientProxy.send<ClientUser>('getUserByEmailOrPhone', {
          email: invitation.clientEmail,
          phoneNumber: invitation.clientNumber,
        }),
      ).catch(() => {});
      const body = generateEmailBody('client-invitation', {
        orderId: order.id,
        orderTitle: order.title,
        orderNumber: order.id,
        orderDescription: '',
        businessName: vendor.name,
        vendorName: vendor.owner?.fullName,
        businessEmail: vendor.profile?.contactEmail,
        businessPhone: vendor.profile?.contactPhoneNumber,
        invitationLink: '',
      });
      this.notificationProxy.emit('sendEmail', {
        email: invitation.clientEmail,
        subject: 'New Order Invitation',
        body,
      });
      if (client) {
        this.notificationProxy.emit<boolean, SendClientAppNotificationDto>(
          'sendClientAppNotification',
          {
            clientId: client.id,
            action: 'order:invitation',
            popup: true,
            message: `You have a new order invitation from ${vendor.name}.`,
            data: { orderId: order.id, invitationId: savedInvitation.id },
          },
        );
      }
      return savedInvitation;
    } catch (error) {
      throw new InternalServerErrorException(error?.message);
    }
  }

  async inviteVendor(
    order: Order,
    client: ClientUser,
    invitationDetails: InviteDetailsDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitation = this.orderInvitationRepository.create({
        order,
        expiresAt: addDays(new Date(), 7),
        type: 'VENDOR',
      });
      if (invitationDetails.medium === OrderInviteMediumEnum.EMAIL) {
        invitation.vendorEmail = invitationDetails.email;
      }
      if (invitationDetails.medium === OrderInviteMediumEnum.PHONE) {
        invitation.vendorNumber = invitationDetails.phoneNumber;
      }
      const savedInvitation = await queryRunner.manager.save(invitation);
      const vendor = await lastValueFrom(
        this.vendorProxy.send<Business>('findBusinessByEmailOrPhone', {
          email: invitation.vendorEmail,
          phoneNumber: invitation.vendorNumber,
        }),
      ).catch(() => {});
      this.notificationProxy.emit('sendEmail', {
        to: invitation.vendorEmail,
        subject: 'New Order Invitation',
        template: 'vendor-invitation',
        context: {
          orderId: order.id,
          orderTitle: order.title,
          orderNumber: order.id,
          orderDescription: '',
          clientName: client.fullName,
          clientEmail: client.email,
          clientPhoneNumber: client.phoneNumber,
          invitationLink: '',
        },
      });
      if (vendor) {
        this.notificationProxy.emit<boolean, SendVendorAppNotificationDto>(
          'sendVendorAppNotification',
          {
            businessId: vendor.id,
            action: 'order:invitation',
            popup: true,
            message: `You have a new order invitation from ${vendor.name}.`,
            data: { orderId: order.id, invitationId: savedInvitation.id },
          },
        );
      }
      return savedInvitation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error?.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getClientInvitations(clientId: string, status?: InvitationStatusEnum) {
    const invitations = await this.orderInvitationRepository.find({
      where: { clientId, status },
      order: { createdAt: 'DESC' },
    });
    return invitations;
  }

  async getVendorInvitations(vendorId: string, status?: InvitationStatusEnum) {
    const invitations = await this.orderInvitationRepository.find({
      where: { vendorId, status },
      order: { createdAt: 'DESC' },
    });
    return invitations;
  }

  async clientAcceptInvitation(invitationId: string, clientId: string) {
    const invitation = await this.orderInvitationRepository.findOne({
      where: {
        id: invitationId,
        clientId,
      },
      relations: { order: true },
    });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status === InvitationStatusEnum.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }
    invitation.status = InvitationStatusEnum.ACCEPTED;
    await invitation.save();
    return invitation;
  }

  async vendorAcceptInvitation(invitationId: string, vendorId: string) {
    const invitation = await this.orderInvitationRepository.findOne({
      where: {
        id: invitationId,
        vendorId,
        status: InvitationStatusEnum.PENDING,
      },
    });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status === InvitationStatusEnum.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }
    invitation.status = InvitationStatusEnum.ACCEPTED;
    await invitation.save();
    return invitation;
  }

  async rejectInvitation(invitationId: string) {
    const invitation = await this.orderInvitationRepository.findOne({
      where: { id: invitationId },
    });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    invitation.status = InvitationStatusEnum.DECLINED;
    await invitation.save();
    return invitation;
  }
}
