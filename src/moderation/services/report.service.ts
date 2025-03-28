import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentReport, ReportReason, ReportStatus } from '../entities/content-report.entity';
import { ModerationService } from './moderation.service';
import { Message } from '../../message/entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { ModerationReason } from '../entities/moderation-queue.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(ContentReport)
    private readonly reportRepository: Repository<ContentReport>,
    private readonly moderationService: ModerationService,
  ) {}

  async createReport(
    messageId: string,
    reporterId: string,
    reason: ReportReason,
    details?: string
  ): Promise<ContentReport> {
    const report = this.reportRepository.create({
      messageId,
      reporterId,
      reason,
      details,
      status: ReportStatus.PENDING
    });

    await this.reportRepository.save(report);

    // Check if message needs to be queued for moderation
    const reportCount = await this.getReportCount(messageId);
    if (reportCount >= 3) { // Threshold for automatic moderation queue
      await this.moderationService.queueForModeration(
        { id: messageId } as Message,
        ModerationReason.USER_REPORT
      );
    }

    return report;
  }

  async getReportCount(messageId: string): Promise<number> {
    return this.reportRepository.count({
      where: { messageId, status: ReportStatus.PENDING }
    });
  }

  async reviewReport(
    reportId: string,
    moderator: User,
    dismiss: boolean
  ): Promise<ContentReport> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['message']
    });

    if (!report) {
      throw new Error('Report not found');
    }

    report.status = dismiss ? ReportStatus.DISMISSED : ReportStatus.REVIEWED;
    report.reviewedById = moderator.id;
    report.reviewedAt = new Date();

    return this.reportRepository.save(report);
  }

  async getPendingReports(page = 1, limit = 20): Promise<{
    reports: ContentReport[];
    total: number;
  }> {
    const [reports, total] = await this.reportRepository.findAndCount({
      where: { status: ReportStatus.PENDING },
      relations: ['message', 'reporter'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return { reports, total };
  }
}
