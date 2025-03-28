import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { ModerationService } from './services/moderation.service';
import { ImageModerationService } from './services/image-moderation.service';
import { ReportService } from './services/report.service';
import { ModerationMetricsService } from './services/moderation-metrics.service';
import { ModerationController } from './controllers/moderation.controller';
import { ModerationQueue } from './entities/moderation-queue.entity';
import { ContentReport } from './entities/content-report.entity';
import { ConfigModule } from '@nestjs/config';
import { ModerationQueueProcessor } from './jobs/moderation-queue.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModerationQueue, ContentReport]),
    HttpModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'moderation',
    }),
  ],
  providers: [
    ModerationService,
    ImageModerationService,
    ReportService,
    ModerationMetricsService,
    ModerationQueueProcessor,
  ],
  controllers: [ModerationController],
  exports: [ModerationService, ReportService, ModerationMetricsService],
})
export class ModerationModule {}
