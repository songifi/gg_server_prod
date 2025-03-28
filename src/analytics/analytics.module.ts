import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregationService } from './aggregation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AggregationService],
  exports: [AnalyticsService, AggregationService],
})
export class AnalyticsModule {}
