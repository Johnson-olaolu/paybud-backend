import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../entities/order-item.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from '../dto/create-order-item.dto';
import { Order } from '../entities/order.entity';
import { UpdateOrderItemDto } from '../dto/update-order-item.dto';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrderItem(order: Order, createOrderItemDto: CreateOrderItemDto) {
    const orderItem = this.orderItemRepository.create({
      order,
      ...createOrderItemDto,
    });
    return await orderItem.save();
  }

  async createOrUpdateOrderItem(
    order: Order,
    updateOrderItemDto: UpdateOrderItemDto,
  ) {
    await this.orderItemRepository.upsert(
      {
        order,
        ...updateOrderItemDto,
      },
      ['id'],
    );
  }

  async getOrderItemsByOrder(order: Order) {
    return this.orderItemRepository.find({
      where: { order: { id: order.id } },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteOrderItem(id: string) {
    const response = await this.orderItemRepository.softDelete({ id });
    if (!response.affected || response.affected === 0) {
      throw new NotFoundException('Order Item not found');
    }
    return true;
  }
}
