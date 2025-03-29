import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentCacheService } from 'src/cache/content-cache.service';
import { Content } from './entities/content.entity';

@Controller('content')
export class ContentController {
  constructor(
    private contentService: ContentService,
    private contentCacheService: ContentCacheService,
  ) {}

  @Get()
  async findAll() {
    return this.contentService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('region') region?: string,
    @Query('fresh') fresh?: string,
  ) {
    return this.contentCacheService.getContent(id, region, fresh === 'true');
  }

  @Post()
  async create(@Body() contentData: Partial<Content>) {
    return this.contentService.create(contentData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() contentData: Partial<Content>) {
    const result = await this.contentService.update(id, contentData);
    // Cache will be automatically invalidated by the subscriber
    return result;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contentService.remove(id);
    await this.contentCacheService.invalidateContent(id);
    return { success: true };
  }

  @Get('analytics/:id')
  async getContentAnalytics(@Param('id') id: string) {
    return this.contentCacheService.getContentAnalytics(id);
  }
}
