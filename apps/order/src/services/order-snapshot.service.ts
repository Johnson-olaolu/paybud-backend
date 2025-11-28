import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderSnapshot } from '../entities/order-snapshot.entity';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import type { Order as OrderType } from '@app/shared/types/order';

@Injectable()
export class OrderSnapshotService {
  constructor(
    @InjectRepository(OrderSnapshot)
    private orderSnapshotRepository: Repository<OrderSnapshot>,
  ) {}

  async createSnapshot(order: Order) {
    const snapshot = this.orderSnapshotRepository.create({
      order: order,
      name: `Snapshot at ${new Date().toISOString()}`,
      data: { ...order } as OrderType,
    });
    return this.orderSnapshotRepository.save(snapshot);
  }

  async getSnapshotsByOrder(order: Order) {
    return this.orderSnapshotRepository.find({
      where: { order: { id: order.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async getSnapshotById(id: string) {
    const snapshot = await this.orderSnapshotRepository.findOne({
      where: { id },
    });
    if (!snapshot) {
      throw new NotFoundException('Snapshot not found');
    }
    return snapshot;
  }

  async deleteSnapshot(id: string) {
    const response = await this.orderSnapshotRepository.delete({ id });
    if (!response.affected || response.affected === 0) {
      throw new NotFoundException('Snapshot not found');
    }
    return true;
  }
}
