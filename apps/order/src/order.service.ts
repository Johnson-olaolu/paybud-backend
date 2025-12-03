/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ClientCreateOrderDto,
  VendorCreateOrderDto,
} from './dto/create-order.dto';
import { OrderInvitationService } from './services/order-invitation.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderItemService } from './services/order-item.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  InvitationStatusEnum,
  ORDER_JOB_NAMES,
  OrderStatusEnum,
} from './utils/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { ClientUser } from '@app/shared/types/client';
import type { Business } from '@app/shared/types/vendor';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  SendClientAppNotificationDto,
  SendVendorAppNotificationDto,
} from '@app/shared/dto/notification.dto';
// import ms from 'ms';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInvitationService: OrderInvitationService,
    private readonly orderItemServioce: OrderItemService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT) private clientProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.NOTIFICATION)
    private notificationProxy: ClientProxy,
    private dataSource: DataSource,
    @InjectQueue(ORDER_JOB_NAMES.PROCESS_ORDER_STATUS_CHANGE)
    private orderStatusChangeQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async vendorCreatesOrder(vendorCreateOrderDto: VendorCreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const vendor = await lastValueFrom(
        this.vendorProxy.send<Business>(
          'findOneBusiness',
          vendorCreateOrderDto.vendorId,
        ),
      ).catch((error) => {
        throw new BadRequestException(error?.message);
      });
      const order = this.orderRepository.create({
        title: vendorCreateOrderDto.title,
        vendorId: vendor.id,
        description: vendorCreateOrderDto.description,
        amount: vendorCreateOrderDto.amount,
        startDate: vendorCreateOrderDto.startDate,
        endDate: vendorCreateOrderDto.endDate,
      });
      const savedOrder = await queryRunner.manager.save(order);
      for (const orderItemDto of vendorCreateOrderDto.orderItems) {
        await this.orderItemServioce.createOrderItem(savedOrder, orderItemDto);
      }
      await this.orderInvitationService.inviteClient(
        savedOrder,
        vendor,
        vendorCreateOrderDto.inviteDetails,
        queryRunner,
      );
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error?.message);
    } finally {
      await queryRunner.release();
    }
  }

  async clientCreatesOrder(clientCreateOrderDto: ClientCreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const client = await lastValueFrom(
        this.clientProxy.send<ClientUser>(
          'findOneClient',
          clientCreateOrderDto.clientId,
        ),
      ).catch((error) => {
        throw new BadRequestException(error?.message);
      });
      const order = this.orderRepository.create({
        title: clientCreateOrderDto.title,
        vendorId: client.id,
        description: clientCreateOrderDto.description,
        amount: clientCreateOrderDto.amount,
        startDate: clientCreateOrderDto.startDate,
        endDate: clientCreateOrderDto.endDate,
      });
      const savedOrder = await queryRunner.manager.save(order);
      for (const orderItemDto of clientCreateOrderDto.orderItems) {
        await this.orderItemServioce.createOrderItem(savedOrder, orderItemDto);
      }
      await this.orderInvitationService.inviteVendor(
        savedOrder,
        client,
        clientCreateOrderDto.inviteDetails,
        queryRunner,
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(error?.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrder(updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(updateOrderDto.id);
    order.amount = updateOrderDto.amount;
    order.feesToBePaidBy = updateOrderDto.feesToBePaidBy!;
    return order.save();
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }

  async findAll() {
    const orders = await this.orderRepository.find();
    return orders;
  }

  async getClientInvitations(clientId: string, status?: InvitationStatusEnum) {
    return this.orderInvitationService.getClientInvitations(clientId, status);
  }

  async getVendorInvitations(vendorId: string, status?: InvitationStatusEnum) {
    return this.orderInvitationService.getVendorInvitations(vendorId, status);
  }

  async clientAcceptInvitation(invitationId: string, clientId: string) {
    const orderInvitation =
      await this.orderInvitationService.clientAcceptInvitation(
        invitationId,
        clientId,
      );
    const order = await this.findOne(orderInvitation.order.id);
    order.clientId = orderInvitation.clientId;
    order.status = OrderStatusEnum.INVITATION_ACCEPTED;
    const savedOrder = await order.save();
    await this.orderStatusChangeQueue.add(
      OrderStatusEnum.INVITATION_ACCEPTED,
      {
        order: savedOrder,
      },
      {
        jobId: `process-order-status-change-${orderInvitation.order.id}-${OrderStatusEnum.INVITATION_ACCEPTED}`,
      },
    );
    return orderInvitation;
  }

  async vendorAcceptInvitation(invitationId: string, vendorId: string) {
    const orderInvitation =
      await this.orderInvitationService.vendorAcceptInvitation(
        invitationId,
        vendorId,
      );
    const order = await this.findOne(orderInvitation.order.id);
    order.vendorId = orderInvitation.vendorId;
    order.status = OrderStatusEnum.INVITATION_ACCEPTED;
    const savedOrder = await order.save();
    await this.orderStatusChangeQueue.add(
      OrderStatusEnum.INVITATION_ACCEPTED,
      {
        order: savedOrder,
      },
      {
        jobId: `process-order-status-change-${orderInvitation.order.id}-${OrderStatusEnum.INVITATION_ACCEPTED}`,
      },
    );
    return orderInvitation;
  }

  async vendorUpdateOrder(orderId: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(orderId);
    if (updateOrderDto.amount) order.amount = updateOrderDto.amount;
    if (updateOrderDto.feesToBePaidBy)
      order.feesToBePaidBy = updateOrderDto.feesToBePaidBy;
    if (updateOrderDto.endDate) order.endDate = updateOrderDto.endDate;
    for (const orderItemDto of updateOrderDto.orderItems) {
      await this.orderItemServioce.createOrUpdateOrderItem(order, orderItemDto);
    }

    this.notificationProxy.emit<boolean, SendClientAppNotificationDto>(
      'sendClientNotification',
      {
        clientId: order.clientId,
        action: 'order:changed',
        message: `Vendor made changes to order #${order?.id},`,
        data: order,
      },
    );
    return order;
  }

  async clientUpdateOrder(orderId: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(orderId);
    if (updateOrderDto.amount) order.amount = updateOrderDto.amount;
    if (updateOrderDto.feesToBePaidBy)
      order.feesToBePaidBy = updateOrderDto.feesToBePaidBy;
    if (updateOrderDto.endDate) order.endDate = updateOrderDto.endDate;
    for (const orderItemDto of updateOrderDto.orderItems) {
      await this.orderItemServioce.createOrUpdateOrderItem(order, orderItemDto);
    }
    this.notificationProxy.emit<boolean, SendVendorAppNotificationDto>(
      'sendVendorNotification',
      {
        businessId: order.vendorId,
        action: 'order:changed',
        message: `Client made changes to order #${order?.id} `,
        data: order,
      },
    );
    return order;
  }

  async deleteOrder(id: string) {
    const order = await this.findOne(id);
    if (order.status !== OrderStatusEnum.DRAFT) {
      throw new BadRequestException('Only draft orders can be deleted');
    }
    await this.orderInvitationService.cancelOrderInvitations(order);
    await this.orderRepository.softDelete({ id: order.id });
    return true;
  }

  async cancelOrder(id: string) {
    const order = await this.findOne(id);
    const allowedStatuses = [
      OrderStatusEnum.PENDING_CONFIRMATION,
      OrderStatusEnum.PENDING_PAYMENT,
    ];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Only orders with status ${allowedStatuses.join(
          ' or ',
        )} can be cancelled`,
      );
    }
    order.status = OrderStatusEnum.CANCELLED;
    await this.orderRepository.save(order);
    return order;
  }

  async clientApprovesOrder(id: string) {
    const order = await this.findOne(id);
    if (order.status !== OrderStatusEnum.INVITATION_ACCEPTED) {
      throw new BadRequestException(
        'Only orders pending client approval can be approved',
      );
    }
    order.status = OrderStatusEnum.CLIENT_APPROVED;
    const savedOrder = await order.save();
    await this.orderStatusChangeQueue.add(
      OrderStatusEnum.CLIENT_APPROVED,
      {
        order: savedOrder,
      },
      {
        jobId: `process-order-status-change-${savedOrder.id}-${OrderStatusEnum.CLIENT_APPROVED}`,
      },
    );
    return savedOrder;
  }

  async vendorApprovesOrder(id: string) {
    const order = await this.findOne(id);
    if (order.status !== OrderStatusEnum.CLIENT_APPROVED) {
      throw new BadRequestException(
        'Only orders pending vendor approval can be approved',
      );
    }
    order.status = OrderStatusEnum.PENDING_PAYMENT;
    const savedOrder = await order.save();
    await this.orderStatusChangeQueue.add(
      OrderStatusEnum.PENDING_PAYMENT,
      {
        order: savedOrder,
      },
      {
        jobId: `process-order-status-change-${savedOrder.id}-${OrderStatusEnum.PENDING_PAYMENT}`,
      },
    );
    return savedOrder;
  }
  // async vendorCancelActiveOrder(id: string) {
  //   const order = await this.orderRepository.findOne({
  //     where: { id, status: OrderStatusEnum.ACTIVE },
  //   });
  //   if (!order) {
  //     throw new BadRequestException('Active Order not found');
  //   }
  //   const key = `order-cancel-${order.clientId}-${order.id}`;
  //   const clientAcceptedCancel = await this.cacheManager.get<boolean>(key);
  //   if (!clientAcceptedCancel) {
  //     //send vendor notification to accept cancelation
  //     const vendorKey = `order-cancel-vendor-${order.vendorId}-${order.id}`;
  //     await this.cacheManager.set(vendorKey, true, ms('1d'));
  //   }
  // }
  // async clientCancelActiveOrder(id: string) {}
}
