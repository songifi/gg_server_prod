import { Controller, Get, Param } from '@nestjs/common';
import { HealthMonitorService } from '../services/health-monitor.service';
import { RegionStatus } from '../entities/region-config.entity';
import { RegionHealth } from '../interfaces/health.interface';

@Controller('data-sync/health')
export class HealthController {
  constructor(
    private readonly healthMonitorService: HealthMonitorService,
  ) {}

  @Get()
  async getHealthSummary() {
    return this.healthMonitorService.getHealthSummary();
  }

  @Get('regions')
  async getAllRegionsHealth(): Promise<Array<{ regionId: string } & RegionHealth>> {
    const healthMap = await this.healthMonitorService.getAllRegionsHealth();
    return Array.from(healthMap.entries()).map(([regionId, health]) => ({
      regionId,
      ...health,
    }));
  }

  @Get('regions/:regionId')
  async getRegionHealth(@Param('regionId') regionId: string): Promise<RegionHealth | { status: RegionStatus; message: string }> {
    const health = await this.healthMonitorService.getRegionHealth(regionId);
    if (!health) {
      return {
        status: RegionStatus.INACTIVE,
        message: 'Region not found or health data not available',
      };
    }
    return health;
  }
}
