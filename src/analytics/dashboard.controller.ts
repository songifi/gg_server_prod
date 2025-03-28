import { Controller, Get } from '@nestjs/common';
import { AggregationService } from './aggregation.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly aggregationService: AggregationService) {}

  @Get('real-time-metrics')
  async getRealTimeMetrics() {
    return this.aggregationService.getRealTimeMetrics();
  }
}
