import { Inject, Injectable } from '@nestjs/common';
import { VendorCreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { Order } from '@app/shared/types/order';
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

  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
