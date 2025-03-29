import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { ReplicationLog, OperationType, ReplicationStatus } from '../entities/replication-log.entity';
import { RegionConfig, RegionStatus } from '../entities/region-config.entity';
import { ConflictLog } from '../entities/conflict-log.entity';

@Injectable()
export class DataSyncService implements OnModuleInit {
  private currentRegion: RegionConfig;
  private readonly syncInterval: number;

  constructor(
    @InjectRepository(ReplicationLog)
    private readonly replicationLogRepo: Repository<ReplicationLog>,
    @InjectRepository(RegionConfig)
    private readonly regionConfigRepo: Repository<RegionConfig>,
    @InjectRepository(ConflictLog)
    private readonly conflictLogRepo: Repository<ConflictLog>,
    @InjectQueue('data-sync')
    private readonly dataSyncQueue: Queue,
    private readonly configService: ConfigService,
  ) {
    this.syncInterval = this.configService.get('SYNC_INTERVAL_MS') || 5000;
  }

  async onModuleInit() {
    await this.initializeCurrentRegion();
    this.startPeriodicSync();
  }

  private async initializeCurrentRegion() {
    const regionName = this.configService.get('REGION_NAME');
    if (!regionName) {
      throw new Error('REGION_NAME environment variable is required');
    }

    let region = await this.regionConfigRepo.findOne({
      where: { name: regionName },
    });

    if (!region) {
      region = this.regionConfigRepo.create({
        name: regionName,
        host: this.configService.get('DATABASE_HOST'),
        port: this.configService.get('DATABASE_PORT'),
        status: RegionStatus.ACTIVE,
        priority: 1,
        isPrimary: this.configService.get('IS_PRIMARY_REGION') === 'true',
      });
      await this.regionConfigRepo.save(region);
    }

    this.currentRegion = region;
  }

  private startPeriodicSync() {
    setInterval(async () => {
      await this.processReplicationQueue();
    }, this.syncInterval);
  }

  async logOperation(
    tableName: string,
    recordId: string,
    operation: OperationType,
    data: Record<string, any>,
    oldData?: Record<string, any>,
  ): Promise<ReplicationLog> {
    const log = this.replicationLogRepo.create({
      tableName,
      recordId,
      operation,
      data,
      oldData,
      sourceRegion: this.currentRegion,
      status: ReplicationStatus.PENDING,
      sequence: Date.now(), // You might want to use a more sophisticated sequence generator
      timestamp: new Date(),
    });

    await this.replicationLogRepo.save(log);
    await this.dataSyncQueue.add('replicate', { logId: log.id });

    return log;
  }

  async processReplicationQueue() {
    const pendingLogs = await this.replicationLogRepo.find({
      where: {
        status: ReplicationStatus.PENDING,
        sourceRegionId: this.currentRegion.id,
      },
      order: {
        sequence: 'ASC',
      },
      take: 100, // Process in batches
    });

    for (const log of pendingLogs) {
      try {
        await this.replicateToOtherRegions(log);
      } catch (error) {
        console.error(`Failed to replicate log ${log.id}:`, error);
        log.status = ReplicationStatus.FAILED;
        log.errorMessage = error.message;
        await this.replicationLogRepo.save(log);
      }
    }
  }

  private async replicateToOtherRegions(log: ReplicationLog) {
    const otherRegions = await this.regionConfigRepo.find({
      where: {
        id: Not(this.currentRegion.id),
        status: RegionStatus.ACTIVE,
      },
    });

    for (const targetRegion of otherRegions) {
      await this.dataSyncQueue.add(
        'replicate-to-region',
        {
          logId: log.id,
          targetRegionId: targetRegion.id,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
    }
  }

  async getReplicationStatus(): Promise<any> {
    const [
      pendingCount,
      failedCount,
      totalProcessed,
      recentLogs,
      regionStatus,
    ] = await Promise.all([
      this.replicationLogRepo.count({
        where: { status: ReplicationStatus.PENDING },
      }),
      this.replicationLogRepo.count({
        where: { status: ReplicationStatus.FAILED },
      }),
      this.replicationLogRepo.count({
        where: { status: ReplicationStatus.COMPLETED },
      }),
      this.replicationLogRepo.find({
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['sourceRegion', 'targetRegion'],
      }),
      this.regionConfigRepo.find(),
    ]);

    return {
      currentRegion: this.currentRegion,
      stats: {
        pendingCount,
        failedCount,
        totalProcessed,
      },
      recentLogs,
      regionStatus,
    };
  }
}
