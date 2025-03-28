import { Controller, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateEventDto } from './dto/create-events.dto';
import { Event } from './entities/events.entity';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track')
  async trackEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.analyticsService.trackEvent(createEventDto);
  }
}
