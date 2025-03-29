import { RegionStatus } from '../entities/region-config.entity';

export interface RegionHealth {
  status: RegionStatus;
  latency: number;
  replicationLag: number;
  lastChecked: Date;
  metrics: {
    pendingReplications: number;
    failedReplications: number;
    successRate: number;
    avgProcessingTime: number;
  };
}
