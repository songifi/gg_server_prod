import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DataSyncService } from '../services/data-sync.service';
import { ReplicationService } from '../services/replication.service';
import { OperationType } from '../entities/replication-log.entity';

@Controller('data-sync')
export class DataSyncController {
  constructor(
    private readonly dataSyncService: DataSyncService,
    private readonly replicationService: ReplicationService,
  ) {}

  @Get('status')
  async getReplicationStatus() {
    return this.dataSyncService.getReplicationStatus();
  }

  @Get('metrics/:regionId')
  async getRegionMetrics(@Param('regionId') regionId: string) {
    return this.replicationService.getReplicationMetrics(regionId);
  }

  @Post('manual-sync')
  async triggerManualSync(@Body() data: { tableName: string; recordId: string }) {
    const { tableName, recordId } = data;
    return this.dataSyncService.logOperation(
      tableName,
      recordId,
      OperationType.UPDATE,
      { id: recordId, forceSyncTimestamp: new Date() },
    );
  }
}
