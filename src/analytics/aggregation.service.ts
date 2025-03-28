import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AggregationService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getRealTimeMetrics(): Promise<any> {
    return await this.eventRepository
      .createQueryBuilder('event')
      .select('event.userId, COUNT(*) as eventCount')
      .where("event.timestamp > NOW() - INTERVAL '1 minute'")
      .groupBy('event.userId')
      .getRawMany();
  }
}
