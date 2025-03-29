import { Controller, Get } from '@nestjs/common';
import { ContentCacheService } from './content-cache.service';

@Controller('cache-monitor')
export class CacheMonitorController {
  constructor(private contentCacheService: ContentCacheService) {}

  @Get('performance')
  async getCachePerformance() {
    const performance = await this.contentCacheService.getCachePerformance();

    // Check if we meet the hit ratio requirement
    const meetsCriteria = performance.hitRatio >= 85;

    return {
      ...performance,
      meetsCriteria,
      timestamp: new Date().toISOString(),
    };
  }
}
