import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RegionConfig, RegionStatus } from '../entities/region-config.entity';
import { ReplicationLog, ReplicationStatus } from '../entities/replication-log.entity';
import { RegionHealth } from '../interfaces/health.interface';

@Injectable()
export class HealthMonitorService implements OnModuleInit {
  private readonly healthCheckInterval: number;
  private readonly healthMetrics: Map<string, RegionHealth> = new Map();

  constructor(
    @InjectRepository(RegionConfig)
    private readonly regionConfigRepo: Repository<RegionConfig>,
    @InjectRepository(ReplicationLog)
    private readonly replicationLogRepo: Repository<ReplicationLog>,
    private readonly configService: ConfigService,
  ) {
    this.healthCheckInterval = this.configService.get('HEALTH_CHECK_INTERVAL_MS') || 30000;
  }

  async onModuleInit() {
    this.startHealthChecks();
  }

  private startHealthChecks() {
    setInterval(async () => {
      await this.checkAllRegionsHealth();
    }, this.healthCheckInterval);
  }

  private async checkAllRegionsHealth() {
    const regions = await this.regionConfigRepo.find();

    for (const region of regions) {
      try {
        const health = await this.checkRegionHealth(region);
        this.healthMetrics.set(region.id, health);

        // Update region status in database
        region.status = health.status;
        region.latency = health.latency;
        region.replicationLag = health.replicationLag;
        await this.regionConfigRepo.save(region);

      } catch (error) {
        console.error(`Failed to check health for region ${region.name}:`, error);
        this.healthMetrics.set(region.id, {
          status: RegionStatus.DEGRADED,
          latency: -1,
          replicationLag: -1,
          lastChecked: new Date(),
          metrics: {
            pendingReplications: -1,
            failedReplications: -1,
            successRate: 0,
            avgProcessingTime: -1,
          },
        });
      }
    }
  }

  private async checkRegionHealth(region: RegionConfig): Promise<RegionHealth> {
    const startTime = Date.now();

    // Check database connectivity
    try {
      await this.pingRegionDatabase(region);
    } catch (error) {
      return {
        status: RegionStatus.INACTIVE,
        latency: -1,
        replicationLag: -1,
        lastChecked: new Date(),
        metrics: {
          pendingReplications: -1,
          failedReplications: -1,
          successRate: 0,
          avgProcessingTime: -1,
        },
      };
    }

    const latency = Date.now() - startTime;

    // Get replication metrics
    const [
      pendingCount,
      failedCount,
      totalCount,
      replicationLag,
      avgProcessingTime,
    ] = await Promise.all([
      this.replicationLogRepo.count({
        where: {
          targetRegionId: region.id,
          status: ReplicationStatus.PENDING,
        },
      }),
      this.replicationLogRepo.count({
        where: {
          targetRegionId: region.id,
          status: ReplicationStatus.FAILED,
        },
      }),
      this.replicationLogRepo.count({
        where: {
          targetRegionId: region.id,
        },
      }),
      this.calculateReplicationLag(region.id),
      this.calculateAverageProcessingTime(region.id),
    ]);

    const successRate = totalCount > 0 
      ? ((totalCount - failedCount) / totalCount) * 100 
      : 100;

    // Determine status based on metrics
    let status = RegionStatus.ACTIVE;
    if (latency > 1000 || replicationLag > 300 || successRate < 95) {
      status = RegionStatus.DEGRADED;
    }
    if (latency > 5000 || replicationLag > 900 || successRate < 80) {
      status = RegionStatus.INACTIVE;
    }

    return {
      status,
      latency,
      replicationLag,
      lastChecked: new Date(),
      metrics: {
        pendingReplications: pendingCount,
        failedReplications: failedCount,
        successRate,
        avgProcessingTime,
      },
    };
  }

  private async pingRegionDatabase(region: RegionConfig): Promise<void> {
    // In a real implementation, you would:
    // 1. Establish a connection to the region's database
    // 2. Run a simple query like "SELECT 1"
    // 3. Measure the response time
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  }

  private async calculateReplicationLag(regionId: string): Promise<number> {
    const result = await this.replicationLogRepo
      .createQueryBuilder('log')
      .where('log.targetRegionId = :regionId', { regionId })
      .andWhere('log.status = :status', { status: ReplicationStatus.COMPLETED })
      .select('AVG(EXTRACT(EPOCH FROM (log.completedAt - log.createdAt)))', 'lag')
      .getRawOne();

    return result?.lag || 0;
  }

  private async calculateAverageProcessingTime(regionId: string): Promise<number> {
    const result = await this.replicationLogRepo
      .createQueryBuilder('log')
      .where('log.targetRegionId = :regionId', { regionId })
      .andWhere('log.status = :status', { status: ReplicationStatus.COMPLETED })
      .andWhere('log.processedAt IS NOT NULL')
      .select('AVG(EXTRACT(EPOCH FROM (log.completedAt - log.processedAt)))', 'avgTime')
      .getRawOne();

    return result?.avgTime || 0;
  }

  async getRegionHealth(regionId: string): Promise<RegionHealth | undefined> {
    return this.healthMetrics.get(regionId);
  }

  async getAllRegionsHealth(): Promise<Map<string, RegionHealth>> {
    return this.healthMetrics;
  }

  async getHealthSummary(): Promise<any> {
    const regions = await this.regionConfigRepo.find();
    const summary = {
      totalRegions: regions.length,
      activeRegions: 0,
      degradedRegions: 0,
      inactiveRegions: 0,
      overallHealth: 'healthy',
      regions: {},
    };

    for (const region of regions) {
      const health = this.healthMetrics.get(region.id);
      if (!health) continue;

      switch (health.status) {
        case RegionStatus.ACTIVE:
          summary.activeRegions++;
          break;
        case RegionStatus.DEGRADED:
          summary.degradedRegions++;
          break;
        case RegionStatus.INACTIVE:
          summary.inactiveRegions++;
          break;
      }

      summary.regions[region.name] = {
        status: health.status,
        latency: health.latency,
        replicationLag: health.replicationLag,
        metrics: health.metrics,
      };
    }

    // Determine overall health
    if (summary.inactiveRegions > 0) {
      summary.overallHealth = 'critical';
    } else if (summary.degradedRegions > 0) {
      summary.overallHealth = 'warning';
    }

    return summary;
  }
}
