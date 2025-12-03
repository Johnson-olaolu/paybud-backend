/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { ORDER_JOB_NAMES, OrderStatusEnum } from '../utils/constants';
import { Order } from '../entities/order.entity';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Business } from '@app/shared/types/vendor';
import { ClientUser } from '@app/shared/types/client';
import { OrderChatService } from '../chat/chat.service';
import {
  SendClientAppNotificationDto,
  SendVendorAppNotificationDto,
} from '@app/shared/dto/notification.dto';
import { generateEmailBody } from '../utils/misc';

@Processor(ORDER_JOB_NAMES.PROCESS_ORDER_STATUS_CHANGE)
export class OrderStatusWorker extends WorkerHost {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderChatService: OrderChatService,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT) private clientProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
  ) {
    super();
  }

  async process(job: Job<any, any, OrderStatusEnum>): Promise<any> {
    switch (job.name) {
      case OrderStatusEnum.INVITATION_ACCEPTED: {
        const { order }: { order: Order } = job.data;
        //fetch vendor and client details
        const vendor = await lastValueFrom(
          this.vendorProxy.send<Business>('findOneBusiness', order.vendorId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });

        const client = await lastValueFrom(
          this.clientProxy.send<ClientUser>('findOneUser', order.clientId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });
        void this.orderChatService.createChat(order, vendor, client);

        //send client notifications
        const clientAcceptanceEmailBody = generateEmailBody(
          'client-invitation-accepted',
          {
            clientName: client?.fullName,
            orderTitle: order?.title,
            orderUrl: `${process.env.CLIENT_APP_URL}/order/${order?.id}`,
            vendorBusiness: vendor.name,
            vendorEmail: vendor.businessEmail,
          },
        );
        void this.notificationProxy.emit('sendClientEmail', {
          clientId: client.id,
          subject: 'Vendor Accepted Your Order Invitation',
          body: clientAcceptanceEmailBody,
        });
        void this.notificationProxy.emit<boolean, SendClientAppNotificationDto>(
          'sendClientNotification',
          {
            clientId: client.id,
            action: 'order:accepted',
            popup: true,
            message: `Your order #${order?.id} is now pending payment.`,
            data: order,
          },
        );

        //send vendor notifications
        const vendorAcceptanceEmailBody = generateEmailBody(
          'vendor-invitation-accepted',
          {
            vendorName: vendor.name,
            clientName: client?.fullName,
            clientEmail: client?.email,
            orderTitle: order?.title,
            orderUrl: `${process.env.VENDOR_APP_URL}/dashboard/order/${order?.id}`,
          },
        );
        void this.notificationProxy.emit('sendVendorEmail', {
          businessId: vendor.id,
          subject: 'You Accepted an Order Invitation',
          body: vendorAcceptanceEmailBody,
          // roles: ['admin', 'manager'],
        });
        void this.notificationProxy.emit<boolean, SendVendorAppNotificationDto>(
          'sendVendorNotification',
          {
            businessId: vendor.id,
            action: 'order:pending_payment',
            popup: true,
            message: `Order #${order?.id} is now pending payment.`,
            data: order,
          },
        );
        return `Notifications for order ${order.id} sent status ${job.name} to client ${client.id} and vendor ${vendor.id}`;
      }

      case OrderStatusEnum.CLIENT_APPROVED: {
        const { order }: { order: Order } = job.data;
        const vendor = await lastValueFrom(
          this.vendorProxy.send<Business>('findOneBusiness', order.vendorId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });

        const client = await lastValueFrom(
          this.clientProxy.send<ClientUser>('findOneUser', order.clientId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });

        //send notifications
        this.notificationProxy.emit('sendVendorNotification', {
          businessId: order.vendorId,
          action: 'order:client_approved',
          popup: true,
          message: `Client has approved order #${order.id}.`,
          data: order,
        });
        this.notificationProxy.emit('sendVendorEmail', {
          businessId: order.vendorId,
          subject: 'Client Approved Order',
          body: generateEmailBody('vendor-client-approved-order', {
            vendorName: vendor.name,
            clientName: client.fullName,
            clientEmail: client.email,
            companyName: vendor.name,
            orderId: order.id,
            approvalDate: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            orderTitle: order.title,
            orderUrl: `${process.env.VENDOR_APP_URL}/dashboard/order/${order.id}`,
          }),
        });
        return order.save();
      }
      default:
        throw new BadRequestException('Invalid job name');
    }
  }
}
