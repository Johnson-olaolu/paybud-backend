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
import { Business } from '../../../libs/shared/src/types/vendor';
import { ClientUser } from '../../../libs/shared/src/types/client';
import { OrderItemService } from './services/order-item.service';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInvitationService: OrderInvitationService,
    private readonly orderItemServioce: OrderItemService,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT) private clientProxy: ClientProxy,
    private dataSource: DataSource,
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
      );
      await queryRunner.commitTransaction();
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
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }
}
