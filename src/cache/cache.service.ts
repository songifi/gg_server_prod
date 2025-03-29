import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  generateKey(entity: string, id: string | number, region?: string): string {
    const regionPrefix = region ? `region:${region}:` : '';
    return `${regionPrefix}${entity}:${id}`;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const store = this.cacheManager.stores[0];
    if (store['keys']) {
      const keys = await store['keys'](pattern);
      const multi = store['getClient']().multi();

      keys.forEach((key) => {
        multi.del(key);
      });

      await multi.exec();
    }
  }
}
