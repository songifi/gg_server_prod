import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { DataSyncService } from './services/data-sync.service';
import { ReplicationService } from './services/replication.service';
import { ConflictResolverService } from './services/conflict-resolver.service';
import { HealthMonitorService } from './services/health-monitor.service';
import { DataSyncController } from './controllers/data-sync.controller';
import { HealthController } from './controllers/health.controller';
import { ReplicationLog } from './entities/replication-log.entity';
import { RegionConfig } from './entities/region-config.entity';
import { ConflictLog } from './entities/conflict-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReplicationLog,
      RegionConfig,
      ConflictLog,
    ]),
    BullModule.registerQueue({
      name: 'data-sync',
    }),
    ConfigModule,
  ],
  providers: [
    DataSyncService,
    ReplicationService,
    ConflictResolverService,
    HealthMonitorService,
  ],
  controllers: [
    DataSyncController,
    HealthController,
  ],
  exports: [
    DataSyncService,
  ],
})
export class DataSyncModule {}
