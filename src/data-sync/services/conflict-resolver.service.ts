import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictLog, ConflictStatus, ConflictResolutionStrategy } from '../entities/conflict-log.entity';
import { ReplicationLog } from '../entities/replication-log.entity';

@Injectable()
export class ConflictResolverService {
  constructor(
    @InjectRepository(ConflictLog)
    private readonly conflictLogRepo: Repository<ConflictLog>,
    @InjectRepository(ReplicationLog)
    private readonly replicationLogRepo: Repository<ReplicationLog>,
  ) {}

  async resolveConflict(conflictId: string, resolutionStrategy: ConflictResolutionStrategy): Promise<ConflictLog> {
    const conflict = await this.conflictLogRepo.findOne({
      where: { id: conflictId },
      relations: ['sourceLog', 'conflictingLog'],
    });

    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    let resolvedData: Record<string, any>;

    switch (resolutionStrategy) {
      case ConflictResolutionStrategy.LAST_WRITE_WINS:
        resolvedData = this.resolveLastWriteWins(conflict);
        break;
      case ConflictResolutionStrategy.MANUAL:
        throw new Error('Manual resolution not implemented');
      case ConflictResolutionStrategy.CUSTOM:
        throw new Error('Custom resolution not implemented');
      default:
        throw new Error(`Unknown resolution strategy: ${resolutionStrategy}`);
    }

    conflict.status = ConflictStatus.RESOLVED;
    conflict.resolvedData = resolvedData;
    conflict.resolvedAt = new Date();
    conflict.resolutionStrategy = resolutionStrategy;

    await this.conflictLogRepo.save(conflict);
    return conflict;
  }

  private resolveLastWriteWins(conflict: ConflictLog): Record<string, any> {
    const sourceTimestamp = conflict.sourceLog.timestamp.getTime();
    const conflictingTimestamp = conflict.conflictingLog.timestamp.getTime();

    return sourceTimestamp >= conflictingTimestamp
      ? conflict.sourceData
      : conflict.conflictingData;
  }
} 