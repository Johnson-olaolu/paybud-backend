import { Inject, Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Business } from '@app/shared/types/vendor';

@Injectable()
export class BusinessService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private vendorProxy: ClientProxy,
  ) {}
  async create(createBusinessDto: CreateBusinessDto) {
    const business = await lastValueFrom(
      this.vendorProxy.send<Business>('createBusiness', createBusinessDto),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return business;
  }

  async findAll() {
    const businesses = await lastValueFrom(
      this.vendorProxy.send<Business[]>('findAllBusiness', {}),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return businesses;
  }

  async findOne(id: string) {
    const business = await lastValueFrom(
      this.vendorProxy.send<Business>('findOneBusiness', id),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return business;
  }

  async update(id: string, updateBusinessDto: UpdateBusinessDto) {
    const business = await lastValueFrom(
      this.vendorProxy.send<Business>('updateBusiness', {
        id,
        updateBusinessDto,
      }),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return business;
  }

  async remove(id: string) {
    await lastValueFrom(
      this.vendorProxy.send<boolean>('removeBusiness', id),
    ).catch((error) => {
      throw new RpcException(error);
    });
    return true;
  }
}
