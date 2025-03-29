/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from 'src/content/entities/content.entity';

@Injectable()
export class ContentCacheService {
  private analyticsData: Map<string, { hits: number; misses: number }> =
    new Map();
  private popularContent: Set<string> = new Set();
  private readonly popularThreshold = 100; // Number of hits to consider content popular

  constructor(
    private cacheService: CacheService,
    private circuitBreaker: CircuitBreakerService,
    @InjectRepository(Content)
    private contentRepository: Repository<Content>,
  ) {
    // Schedule cache analytics reports
    setInterval(() => this.generateAnalyticsReport(), 60 * 60 * 1000); // Hourly

    // Schedule background revalidation for popular content
    setInterval(() => this.revalidatePopularContent(), 15 * 60 * 1000); // Every 15 minutes
  }

  async getContent(
    contentId: string | number,
    region?: string,
    forceFresh = false,
  ): Promise<any> {
    const cacheKey = this.cacheService.generateKey(
      'content',
      contentId,
      region,
    );

    // Skip cache for force fresh requests
    if (!forceFresh) {
      // Check if circuit is closed before attempting cache
      const circuitClosed = await this.circuitBreaker.isCircuitClosed('redis');

      if (circuitClosed) {
        try {
          const cachedContent = await this.cacheService.get(cacheKey);

          if (cachedContent) {
            this.recordAnalytics(cacheKey, 'hit');
            this.trackPopularContent(cacheKey);
            return cachedContent;
          }
        } catch (error) {
          this.circuitBreaker.recordFailure('redis');
          console.error('Cache retrieval failed:', error);
          // Continue to fetch from database
        }
      }
    }

    // Cache miss or bypass - get from database
    this.recordAnalytics(cacheKey, 'miss');

    try {
      const content = await this.contentRepository.findOne({
        where: { id: contentId.toString() },
      });

      if (!content) {
        return null;
      }

      // Update views count
      content.views += 1;
      content.last_accessed = new Date();
      await this.contentRepository.save(content);

      // Store in cache with TTL based on content type
      const ttl = this.determineTTL(content);

      if (ttl > 0) {
        try {
          await this.cacheService.set(cacheKey, content, ttl);
          this.circuitBreaker.recordSuccess('redis');
        } catch (error) {
          this.circuitBreaker.recordFailure('redis');
          console.error('Cache storage failed:', error);
        }
      }

      return content;
    } catch (error) {
      console.error(`Database retrieval failed for ${contentId}:`, error);
      throw error;
    }
  }

  // Background reload of content that's about to expire
  private async backgroundReload(
    key: string,
    contentId: string | number,
  ): Promise<void> {
    try {
      const content = await this.contentRepository.findOne({
        where: { id: contentId.toString() },
      });
      if (content) {
        const ttl = this.determineTTL(content);
        await this.cacheService.set(key, content, ttl);
      }
    } catch (error) {
      console.error(`Background reload failed for ${contentId}:`, error);
    }
  }

  // Determine TTL based on content properties
  private determineTTL(content: Content): number {
    // Implement logic based on content type, update frequency, etc.
    if (content.type === 'static') {
      return 24 * 60 * 60; // 24 hours for static content
    } else if (content.type === 'dynamic') {
      return 5 * 60; // 5 minutes for dynamic content
    } else if (content.type === 'user-specific') {
      return 60; // 1 minute for user-specific content
    }

    return 60 * 60; // Default: 1 hour
  }

  // Handle cache invalidation when content is updated
  async invalidateContent(
    contentId: string | number,
    region?: string,
  ): Promise<void> {
    if (region) {
      // Invalidate specific regional cache
      const cacheKey = this.cacheService.generateKey(
        'content',
        contentId,
        region,
      );
      await this.cacheService.invalidate(cacheKey);
    } else {
      // Invalidate all regions
      await this.cacheService.invalidatePattern(`*:content:${contentId}`);
    }
  }

  // Warm cache for predictable high-demand content
  async warmCache(
    contentIds: (string | number)[],
    regions: string[] = [],
  ): Promise<void> {
    const promises = [];

    for (const id of contentIds) {
      if (regions.length === 0) {
        // Warm default cache
        promises.push(this.getContent(id, undefined, true));
      } else {
        // Warm all specified regions
        for (const region of regions) {
          promises.push(this.getContent(id, region, true));
        }
      }
    }

    await Promise.all(promises);
    console.log(`Cache warmed for ${promises.length} content items`);
  }

  // Track analytics
  private recordAnalytics(key: string, result: 'hit' | 'miss'): void {
    if (!this.analyticsData.has(key)) {
      this.analyticsData.set(key, { hits: 0, misses: 0 });
    }

    const stats = this.analyticsData.get(key);
    if (result === 'hit') {
      stats.hits += 1;
    } else {
      stats.misses += 1;
    }
  }

  // Track popular content for background revalidation
  private trackPopularContent(key: string): void {
    const stats = this.analyticsData.get(key);
    if (stats && stats.hits > this.popularThreshold) {
      this.popularContent.add(key);
    }
  }

  // Generate analytics report
  private generateAnalyticsReport(): void {
    let totalHits = 0;
    let totalMisses = 0;

    this.analyticsData.forEach((stats) => {
      totalHits += stats.hits;
      totalMisses += stats.misses;
    });

    const hitRatio = (totalHits / (totalHits + totalMisses || 1)) * 100;

    console.log('Cache Analytics Report:');
    console.log(`Total Hits: ${totalHits}`);
    console.log(`Total Misses: ${totalMisses}`);
    console.log(`Hit Ratio: ${hitRatio.toFixed(2)}%`);
    console.log(`Popular Content Items: ${this.popularContent.size}`);

    // Reset counters after reporting (keep popular content)
    this.analyticsData = new Map();
  }

  // Background revalidation for popular content
  private async revalidatePopularContent(): Promise<void> {
    const promises = [];

    for (const key of this.popularContent) {
      // Extract contentId from key
      const parts = key.split(':');
      const contentId = parts[parts.length - 1];

      promises.push(this.backgroundReload(key, contentId));
    }

    await Promise.all(promises);
    console.log(`Revalidated ${promises.length} popular content items`);
  }

  // Get current analytics for a specific piece of content
  async getContentAnalytics(contentId: string | number): Promise<any> {
    const pattern = `*:content:${contentId}`;
    const stats = {
      hits: 0,
      misses: 0,
      hitRatio: 0,
      isPopular: false,
    };

    this.analyticsData.forEach((data, key) => {
      if (key.includes(`content:${contentId}`)) {
        stats.hits += data.hits;
        stats.misses += data.misses;
      }
    });

    stats.hitRatio = (stats.hits / (stats.hits + stats.misses || 1)) * 100;
    stats.isPopular = this.popularContent.has(`content:${contentId}`);

    return stats;
  }

  // Get overall cache performance
  async getCachePerformance(): Promise<any> {
    let totalHits = 0;
    let totalMisses = 0;

    this.analyticsData.forEach((stats) => {
      totalHits += stats.hits;
      totalMisses += stats.misses;
    });

    const hitRatio = (totalHits / (totalHits + totalMisses || 1)) * 100;

    return {
      totalHits,
      totalMisses,
      hitRatio,
      popularContentCount: this.popularContent.size,
    };
  }
}
