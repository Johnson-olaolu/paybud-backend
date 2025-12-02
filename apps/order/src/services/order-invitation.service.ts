/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/env.config';

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
    @InjectQueue(ORDER_JOB_NAMES.ORDER_INVITATIONS_EXPIRATION_HANDLER)
    private orderInvitationQueue: Queue,
    private configService: ConfigService<EnvironmentVariables>,
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
        vendorId: vendor.id,
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
      const invitationLink = client
        ? `${this.configService.get('CLIENT_FRONTEND_URL')}/invitations/${savedInvitation.id}`
        : `${this.configService.get('CLIENT_FRONTEND_URL')}/register?invitationId=${savedInvitation.id}`;
      const body = generateEmailBody('client-invitation', {
        orderId: order.id,
        orderTitle: order.title,
        orderNumber: order.id,
        orderDescription: order.description || '',
        businessName: vendor.name,
        vendorName: vendor.owner?.fullName,
        businessEmail: vendor.profile?.contactEmail,
        businessPhone: vendor.profile?.contactPhoneNumber,
        invitationLink,
      });
      this.notificationProxy.emit('sendEmail', {
        email: invitation.clientEmail,
        subject: 'New Order Invitation',
        body,
      });
      if (client) {
        this.notificationProxy.emit<boolean, SendClientAppNotificationDto>(
          'sendClientNotification',
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
    queryRunner: QueryRunner,
  ) {
    try {
      const invitation = this.orderInvitationRepository.create({
        order,
        expiresAt: addDays(new Date(), 7),
        type: 'VENDOR',
        medium: invitationDetails.medium,
        clientId: client.id,
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
      const body = generateEmailBody('vendor-invitation', {
        orderId: order.id,
        orderTitle: order.title,
        orderNumber: order.id,
        orderDescription: '',
        clientName: client.fullName,
        clientEmail: client.email,
        clientPhoneNumber: client.phoneNumber,
        invitationLink: '',
      });
      this.notificationProxy.emit('sendEmail', {
        email: invitation.vendorEmail,
        subject: 'New Order Invitation',
        body,
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
      throw new InternalServerErrorException(error?.message);
    }
  }

  async getClientInvitations(clientId: string, status?: InvitationStatusEnum) {
    const client = await lastValueFrom(
      this.clientProxy.send<ClientUser>('findOneUser', clientId),
    ).catch((error) => {
      throw new BadRequestException(error?.message);
    });
    const invitations = await this.orderInvitationRepository.find({
      where: [
        { clientId, type: 'CLIENT', status },
        { clientEmail: client.email, type: 'CLIENT', status },
        // { clientNumber: client.phoneNumber, type: 'CLIENT', status },
      ],
      order: { createdAt: 'DESC' },
    });
    return invitations;
  }

  async getVendorInvitations(vendorId: string, status?: InvitationStatusEnum) {
    const vendor = await lastValueFrom(
      this.vendorProxy.send<Business>('findOneBusiness ', vendorId),
    ).catch((error) => {
      throw new BadRequestException(error?.message);
    });
    const invitations = await this.orderInvitationRepository.find({
      where: [
        { vendorId, type: 'VENDOR', status },
        { vendorEmail: vendor.owner?.email, type: 'VENDOR', status },
        {
          vendorNumber: vendor.profile?.contactPhoneNumber,
          type: 'VENDOR',
          status,
        },
      ],
      order: { createdAt: 'DESC' },
    });
    return invitations;
  }

  async clientAcceptInvitation(invitationId: string, clientId: string) {
    const invitation = await this.orderInvitationRepository.findOne({
      where: {
        id: invitationId,
      },
      relations: { order: true },
    });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status === InvitationStatusEnum.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.status === InvitationStatusEnum.ACCEPTED) {
      throw new BadRequestException('Invitation has already been accepted');
    }
    if (invitation.status === InvitationStatusEnum.CANCELLED) {
      throw new BadRequestException(
        'The order for this invitation has been cancelled',
      );
    }
    if (invitation.status === InvitationStatusEnum.DECLINED) {
      throw new BadRequestException('Invitation has been declined');
    }
    invitation.clientId = clientId;
    invitation.status = InvitationStatusEnum.ACCEPTED;
    invitation.respondedAt = new Date();
    await invitation.save();
    return invitation;
  }

  async vendorAcceptInvitation(invitationId: string, vendorId: string) {
    const invitation = await this.orderInvitationRepository.findOne({
      where: {
        id: invitationId,
      },
      relations: { order: true },
    });
    if (!invitation) {
      throw new BadRequestException('Invitation not found');
    }
    if (invitation.status === InvitationStatusEnum.EXPIRED) {
      throw new BadRequestException('Invitation has expired');
    }
    if (invitation.status === InvitationStatusEnum.ACCEPTED) {
      throw new BadRequestException('Invitation has already been accepted');
    }
    if (invitation.status === InvitationStatusEnum.CANCELLED) {
      throw new BadRequestException(
        'The order for this invitation has been cancelled',
      );
    }
    if (invitation.status === InvitationStatusEnum.DECLINED) {
      throw new BadRequestException('Invitation has been declined');
    }
    invitation.vendorId = vendorId;
    invitation.status = InvitationStatusEnum.ACCEPTED;
    invitation.respondedAt = new Date();
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
    if (invitation.clientId) {
      const client = await lastValueFrom(
        this.clientProxy.send<ClientUser>('findOneClient', invitation.clientId),
      ).catch((error) => {
        throw new BadRequestException(error?.message);
      });
      this.notificationProxy.emit<boolean, SendClientAppNotificationDto>(
        'sendClientNotification',
        {
          clientId: client.id,
          action: 'order:invitation:declined',
          popup: true,
          message: `Your order invitation has been declined.`,
          data: { orderId: invitation.order.id, invitationId: invitation.id },
        },
      );
    }
    if (invitation.vendorId) {
      const vendor = await lastValueFrom(
        this.vendorProxy.send<Business>(
          'findBusinessById',
          invitation.vendorId,
        ),
      ).catch((error) => {
        throw new BadRequestException(error?.message);
      });
      this.notificationProxy.emit<boolean, SendVendorAppNotificationDto>(
        'sendVendorAppNotification',
        {
          businessId: vendor.id,
          action: 'order:invitation:declined',
          popup: true,
          message: `Your order invitation has been declined.`,
          data: { orderId: invitation.order.id, invitationId: invitation.id },
        },
      );
    }
    await invitation.save();
    return invitation;
  }

  async cancelOrderInvitations(order: Order) {
    const result = await this.orderInvitationRepository.update(
      {
        order,
      },
      {
        status: InvitationStatusEnum.CANCELLED,
      },
    );
    if (result.affected === 0) {
      throw new NotFoundException('No Order Invitations found');
    }
    return true;
  }
}
