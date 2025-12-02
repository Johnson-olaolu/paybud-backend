import { Inject, Injectable } from '@nestjs/common';
import { VendorCreateOrderDto } from './dto/create-order.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type {
  InvitationStatusEnum,
  Order,
  OrderInvitation,
} from '@app/shared/types/order';
import { User } from '@app/shared/types/vendor';

@Injectable()
export class OrderService {
  constructor(@Inject(RABBITMQ_QUEUES.ORDER) private orderProxy: ClientProxy) {}

  async create(createOrderDto: VendorCreateOrderDto, user: User) {
    const order = await lastValueFrom(
      this.orderProxy.send<Order>('vendorCreateOrder', {
        ...createOrderDto,
        vendorId: user.business?.id,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return order;
  }

  async getVendorOrders(user: User, status: InvitationStatusEnum) {
    const orders = await lastValueFrom(
      this.orderProxy.send<OrderInvitation[]>('getVendorInvitations', {
        vendorId: user.business?.id,
        status,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return orders;
  }

  async acceptInvitation(id: string, user: User) {
    const invitation = await lastValueFrom(
      this.orderProxy.send<OrderInvitation>('vendorAcceptInvitation', {
        invitationId: id,
        vendorId: user.business?.id,
      }),
    ).catch((err) => {
      throw new RpcException(err);
    });
    return invitation;
  }
}
