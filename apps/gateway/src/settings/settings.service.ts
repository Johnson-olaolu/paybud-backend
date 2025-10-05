import { RABBITMQ_QUEUES } from '@app/shared/utils/constants';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import ms from 'ms';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(RABBITMQ_QUEUES.VENDOR) private readonly vendorProxy: ClientProxy,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {}

  async fetchBanks() {
    const cacheKey = `banks`;
    let banks = await this.cacheManager.get(cacheKey);
    if (banks) {
      return banks;
    }
    banks = await lastValueFrom(
      this.vendorProxy.send<any[]>('fetchBanks', {}),
    ).catch((error) => {
      throw new RpcException(error);
    });
    await this.cacheManager.set(cacheKey, banks, ms('1d'));
    return banks;
  }
}
