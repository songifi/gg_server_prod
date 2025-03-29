// src/workers/revalidation.worker.ts

import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RevalidationWorker {
  constructor(private readonly cacheService: CacheService) {}

  // Refresh cache for popular content
  async refreshPopularContent(): Promise<void> {
    const popularContentIds = ['media1', 'media2']; // Example content ids

    for (const id of popularContentIds) {
      const cacheKey = `media:${id}:us-west`; // Example region
      const dbData = await this.fetchMediaFromDB(id);
      await this.cacheService.set(cacheKey, JSON.stringify(dbData), 600); // Cache for 10 minutes
    }
  }

  // Mock DB fetch
  async fetchMediaFromDB(id: string): Promise<any> {
    return { id, type: 'image', content: 'updated media content' };
  }
}
