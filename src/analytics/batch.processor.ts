import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Event } from './entities/events.entity';

@Injectable()
export class BatchProcessorService {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async processBatch(events: Event[]): Promise<void> {
    // Process events in batch
    for (const event of events) {
      await this.analyticsService.trackEvent(event);
    }
  }
}
