import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ModerationQueue, ModerationStatus, ModerationReason } from '../entities/moderation-queue.entity';
import { ContentReport, ReportStatus } from '../entities/content-report.entity';

@Injectable()
export class ModerationMetricsService {
  constructor(
    @InjectRepository(ModerationQueue)
    private readonly queueRepository: Repository<ModerationQueue>,
    @InjectRepository(ContentReport)
    private readonly reportRepository: Repository<ContentReport>,
  ) {}

  async getMetrics(startDate: Date, endDate: Date) {
    const [
      queueMetrics,
      reportMetrics,
      averageResponseTime,
      topReasons
    ] = await Promise.all([
      this.getQueueMetrics(startDate, endDate),
      this.getReportMetrics(startDate, endDate),
      this.getAverageResponseTime(startDate, endDate),
      this.getTopModerationReasons(startDate, endDate)
    ]);

    return {
      period: {
        start: startDate,
        end: endDate
      },
      queue: queueMetrics,
      reports: reportMetrics,
      performance: {
        averageResponseTime,
        topReasons
      }
    };
  }

  private async getQueueMetrics(startDate: Date, endDate: Date) {
    const totalItems = await this.queueRepository.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const statusCounts = await this.queueRepository
      .createQueryBuilder('queue')
      .select('queue.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('queue.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .groupBy('queue.status')
      .getRawMany();

    return {
      total: totalItems,
      byStatus: statusCounts.reduce((acc, { status, count }) => ({
        ...acc,
        [status]: parseInt(count)
      }), {})
    };
  }

  private async getReportMetrics(startDate: Date, endDate: Date) {
    const totalReports = await this.reportRepository.count({
      where: {
        createdAt: Between(startDate, endDate)
      }
    });

    const reportStats = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('report.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .groupBy('report.status')
      .getRawMany();

    return {
      total: totalReports,
      byStatus: reportStats.reduce((acc, { status, count }) => ({
        ...acc,
        [status]: parseInt(count)
      }), {})
    };
  }

  private async getAverageResponseTime(startDate: Date, endDate: Date) {
    const result = await this.queueRepository
      .createQueryBuilder('queue')
      .select('AVG(EXTRACT(EPOCH FROM (queue.updatedAt - queue.createdAt)))', 'avgTime')
      .where('queue.status != :status', { status: ModerationStatus.PENDING })
      .andWhere('queue.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .getRawOne();

    return result.avgTime ? Math.round(result.avgTime) : 0;
  }

  private async getTopModerationReasons(startDate: Date, endDate: Date) {
    return this.queueRepository
      .createQueryBuilder('queue')
      .select('queue.reason', 'reason')
      .addSelect('COUNT(*)', 'count')
      .where('queue.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .groupBy('queue.reason')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }
}
