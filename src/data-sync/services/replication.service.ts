import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Not } from 'typeorm';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import { ReplicationLog, ReplicationStatus, OperationType } from '../entities/replication-log.entity';
import { RegionConfig, RegionStatus } from '../entities/region-config.entity';
import { ConflictLog, ConflictStatus, ConflictResolutionStrategy } from '../entities/conflict-log.entity';

@Injectable()
@Processor('data-sync')
export class ReplicationService {
  constructor(
    @InjectRepository(ReplicationLog)
    private readonly replicationLogRepo: Repository<ReplicationLog>,
    @InjectRepository(RegionConfig)
    private readonly regionConfigRepo: Repository<RegionConfig>,
    @InjectRepository(ConflictLog)
    private readonly conflictLogRepo: Repository<ConflictLog>,
    @InjectQueue('data-sync')
    private readonly dataSyncQueue: Queue,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  @Process('replicate-to-region')
  async handleReplication(job: Job<{ logId: string; targetRegionId: string }>) {
    const { logId, targetRegionId } = job.data;
    
    const log = await this.replicationLogRepo.findOne({
      where: { id: logId },
      relations: ['sourceRegion', 'targetRegion'],
    });

    if (!log) {
      throw new Error(`Replication log ${logId} not found`);
    }

    const targetRegion = await this.regionConfigRepo.findOne({
      where: { id: targetRegionId },
    });

    if (!targetRegion || targetRegion.status !== RegionStatus.ACTIVE) {
      throw new Error(`Target region ${targetRegionId} not found or inactive`);
    }

    try {
      // Update status to in progress
      log.status = ReplicationStatus.IN_PROGRESS;
      log.targetRegion = targetRegion;
      await this.replicationLogRepo.save(log);

      // Check for conflicts
      const conflict = await this.checkForConflicts(log);
      if (conflict) {
        log.status = ReplicationStatus.CONFLICT;
        await this.replicationLogRepo.save(log);
        return;
      }

      // Perform the replication
      await this.executeReplication(log);

      // Update status to completed
      log.status = ReplicationStatus.COMPLETED;
      log.completedAt = new Date();
      await this.replicationLogRepo.save(log);

    } catch (error) {
      log.status = ReplicationStatus.FAILED;
      log.errorMessage = error.message;
      log.retryCount += 1;
      await this.replicationLogRepo.save(log);

      throw error;
    }
  }

  private async checkForConflicts(log: ReplicationLog): Promise<boolean> {
    const existingLogs = await this.replicationLogRepo.find({
      where: {
        tableName: log.tableName,
        recordId: log.recordId,
        status: ReplicationStatus.COMPLETED,
        id: Not(log.id),
      },
      order: {
        timestamp: 'DESC',
      },
      take: 1,
    });

    if (existingLogs.length === 0) {
      return false;
    }

    const latestLog = existingLogs[0];
    if (latestLog.timestamp > log.timestamp) {
      // Create conflict log
      const conflict = this.conflictLogRepo.create({
        tableName: log.tableName,
        recordId: log.recordId,
        sourceLog: log,
        conflictingLog: latestLog,
        sourceData: log.data,
        conflictingData: latestLog.data,
        status: ConflictStatus.DETECTED,
        resolutionStrategy: ConflictResolutionStrategy.LAST_WRITE_WINS,
        conflictDetectedAt: new Date(),
      });

      await this.conflictLogRepo.save(conflict);
      return true;
    }

    return false;
  }

  private async executeReplication(log: ReplicationLog): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const targetTable = log.tableName;
      
      switch (log.operation) {
        case OperationType.INSERT:
        case OperationType.UPDATE:
          await manager.query(
            `INSERT INTO ${targetTable} ($1:name) VALUES ($2:csv)
             ON CONFLICT (id) DO UPDATE SET $3:raw`,
            [
              Object.keys(log.data),
              Object.values(log.data),
              Object.entries(log.data)
                .map(([key, value]) => `${key} = EXCLUDED.${key}`)
                .join(', '),
            ],
          );
          break;

        case OperationType.DELETE:
          await manager.query(
            `DELETE FROM ${targetTable} WHERE id = $1`,
            [log.recordId],
          );
          break;

        default:
          throw new Error(`Unknown operation type: ${log.operation}`);
      }
    });
  }

  async getReplicationMetrics(regionId: string): Promise<any> {
    const [
      totalLogs,
      pendingLogs,
      failedLogs,
      avgLatency,
    ] = await Promise.all([
      this.replicationLogRepo.count({
        where: { targetRegionId: regionId },
      }),
      this.replicationLogRepo.count({
        where: {
          targetRegionId: regionId,
          status: ReplicationStatus.PENDING,
        },
      }),
      this.replicationLogRepo.count({
        where: {
          targetRegionId: regionId,
          status: ReplicationStatus.FAILED,
        },
      }),
      this.replicationLogRepo
        .createQueryBuilder('log')
        .where('log.targetRegionId = :regionId', { regionId })
        .andWhere('log.completedAt IS NOT NULL')
        .select('AVG(EXTRACT(EPOCH FROM (log.completedAt - log.createdAt)))', 'avgLatency')
        .getRawOne(),
    ]);

    return {
      totalLogs,
      pendingLogs,
      failedLogs,
      avgLatencySeconds: avgLatency?.avgLatency || 0,
    };
  }
}
