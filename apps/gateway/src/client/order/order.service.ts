import { Inject, Injectable } from '@nestjs/common';
import { ClientCreateOrderDto } from './dto/create-order.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type {
  InvitationStatusEnum,
  Order,
  OrderInvitation,
} from '@app/shared/types/order';
import { ClientUser } from '@app/shared/types/client';

@Injectable()
export class OrderService {
  constructor(
    @Inject(RABBITMQ_QUEUES.ORDER) private readonly orderProxy: ClientProxy,
  ) {}
  async create(createOrderDto: ClientCreateOrderDto, user: ClientUser) {
    const order = await lastValueFrom(
      this.orderProxy.send<Order>('clientCreateOrder', {
        ...createOrderDto,
        clientId: user.id,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return order;
  }

  async getVendorOrders(user: ClientUser, status: InvitationStatusEnum) {
    const orders = await lastValueFrom(
      this.orderProxy.send<OrderInvitation[]>('getClientInvitations', {
        clientId: user.id,
        status,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return orders;
  }

  async acceptInvitation(id: string, user: ClientUser) {
    const invitation = await lastValueFrom(
      this.orderProxy.send<OrderInvitation>('clientAcceptInvitation', {
        invitationId: id,
        clientId: user.id,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return invitation;
  }
}
