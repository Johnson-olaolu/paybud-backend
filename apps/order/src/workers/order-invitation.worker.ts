import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderInvitation } from '../entities/order-invitation.entity';
import { LessThan, Repository } from 'typeorm';
import { Job } from 'bullmq';
import { InvitationStatusEnum, ORDER_JOB_NAMES } from '../utils/constants';

@Processor(ORDER_JOB_NAMES.ORDER_INVITATIONS_EXPIRATION_HANDLER)
export class OrderInvitationWorker extends WorkerHost {
  constructor(
    @InjectRepository(OrderInvitation)
    private orderInvitationRepository: Repository<OrderInvitation>,
  ) {
    super();
  }

  async process(job: Job<any, any, 'expire-invitations'>): Promise<any> {
    switch (job.name) {
      case 'expire-invitations': {
        const response = await this.orderInvitationRepository.update(
          {
            expiresAt: LessThan(new Date()),
            status: InvitationStatusEnum.PENDING,
          },
          { status: InvitationStatusEnum.EXPIRED },
        );
        return { count: response.affected };
      }
    }
  }
}
