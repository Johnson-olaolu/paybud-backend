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

@Processor(ORDER_JOB_NAMES.PROCESS_ORDER_STATUS_CHANGE)
export class OrderWorker extends WorkerHost {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderChatService: OrderChatService,
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
    @Inject(RABBITMQ_QUEUES.CLIENT) private clientProxy: ClientProxy,
  ) {
    super();
  }

  async process(job: Job<{ id: string }, any, OrderStatusEnum>): Promise<any> {
    const { id } = job.data;
    switch (job.name) {
      case OrderStatusEnum.PENDING_PAYMENT: {
        const order = await this.orderRepository.findOne({
          where: { id },
          relations: {},
        });
        const vendor = await lastValueFrom(
          this.vendorProxy.send<Business>('findOneBusiness', order?.vendorId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });

        const client = await lastValueFrom(
          this.clientProxy.send<ClientUser>('findOneClient', order?.clientId),
        ).catch((error) => {
          throw new BadRequestException(error?.message);
        });
        void this.orderChatService.createChat(order!, vendor, client);
      }
    }
  }
}
