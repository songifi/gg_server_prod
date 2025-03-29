import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-events.dto';
import { Event } from './entities/events.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async trackEvent(createEventDto: CreateEventDto): Promise<Event> {
    const { eventName, userId, metadata } = createEventDto;
    const event = new Event();
    event.eventName = eventName;
    event.userId = this.anonymizeUserId(userId);
    event.timestamp = new Date();
    event.metadata = metadata;

    return await this.eventRepository.save(event);
  }

  private anonymizeUserId(userId: string): string {
    return userId ? this.hashString(userId) : null;
  }

  private hashString(str: string): string {
    return Buffer.from(str).toString('base64');
  }
}
