/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, Get, Param, Put, Body, Query } from '@nestjs/common';
import { ContentCacheService } from './content-cache.service';

@Controller('content')
export class ContentController {
  constructor(private contentCacheService: ContentCacheService) {}

  @Get(':id')
  async getContent(
    @Param('id') id: string,
    @Query('region') region?: string,
    @Query('fresh') fresh?: boolean,
  ) {
    return this.contentCacheService.getContent(id, region, fresh === true);
  }

  @Put(':id')
  async updateContent(@Param('id') id: string, @Body() content: any) {
    // Handle your content update logic here
    // Then invalidate cache
    await this.contentCacheService.invalidateContent(id);
    return { success: true };
  }

  @Get('analytics/:id')
  async getContentAnalytics(@Param('id') id: string) {
    return this.contentCacheService.getContentAnalytics(id);
  }

  @Get('analytics/performance')
  async getCachePerformance() {
    return this.contentCacheService.getCachePerformance();
  }
}
