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
import { DataSource, Repository } from 'typeorm';
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
import { SendAppNotificationDto } from '@app/shared/dto/notification.dto';
import { addDays } from 'date-fns';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitation = this.orderInvitationRepository.create({
        order,
        expiresAt: addDays(new Date(), 7),
        type: 'CLIENT',
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
      this.notificationProxy.emit('sendEmail', {
        to: invitation.clientEmail || invitation.clientNumber,
        subject: 'New Order Invitation',
        template: 'client-invitation',
        context: {
          orderId: order.id,
          orderTitle: order.title,
          orderNumber: order.id,
          orderDescription: '',
          businessName: vendor.name,
          vendorName: vendor.owner?.fullName,
          businessEmail: vendor.profile?.contactEmail,
          businessPhone: vendor.profile?.contactPhoneNumber,
          invitationLink: '',
        },
      });
      if (client) {
        this.notificationProxy.emit('sendNotification', {
          userId: client.id,
          action: 'order:invitation',
          clientType: 'client',
          popup: true,
          title: 'New Order Invitation',
          message: `You have a new order invitation from ${vendor.name}.`,
          data: { orderId: order.id, invitationId: savedInvitation.id },
        } as SendAppNotificationDto);
      }
      await queryRunner.commitTransaction();
      return savedInvitation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error?.message);
    } finally {
      await queryRunner.release();
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
      return savedInvitation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error?.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getClientInvitations(clientId: string) {
    const invitations = await this.orderInvitationRepository.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
    return invitations;
  }

  async getVendorInvitations(vendorId: string) {
    const invitations = await this.orderInvitationRepository.find({
      where: { vendorId },
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
}
