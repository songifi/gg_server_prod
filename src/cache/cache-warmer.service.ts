import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ContentCacheService } from './content-cache.service';
import { Content } from 'src/content/entities/content.entity';

@Injectable()
export class CacheWarmerService implements OnModuleInit {
  constructor(
    private contentCacheService: ContentCacheService,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {}

  async onModuleInit() {
    // Warm cache on application startup
    await this.warmFrequentlyAccessedContent();
  }

  @Cron('0 */3 * * *') // Every 3 hours
  async warmFrequentlyAccessedContent() {
    // Get most frequently accessed content
    const popularContent = await this.contentRepository.query(`
      SELECT id FROM content 
      ORDER BY views DESC, last_accessed DESC 
      LIMIT 100
    `);

    const contentIds = popularContent.map((item) => item.id);
    const regions = ['us-east', 'us-west', 'europe', 'asia']; // Example regions

    await this.contentCacheService.warmCache(contentIds, regions);
    console.log(
      `Warmed cache for ${contentIds.length} popular content items across ${regions.length} regions`,
    );
  }
}
