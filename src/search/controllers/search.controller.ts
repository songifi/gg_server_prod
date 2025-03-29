import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SearchService } from '../services/search.service';
import { SuggestionService } from '../services/suggestion.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SuggestionQueryDto } from '../dto/suggestion-query.dto';
import { SearchResult, SuggestionResponse } from '../interfaces/search.types';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly suggestionService: SuggestionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search across all content types' })
  @ApiResponse({ status: 200, description: 'Returns search results with facets' })
  async search(@Request() req, @Query() query: SearchQueryDto): Promise<SearchResult> {
    return this.searchService.search(req.user.id, query);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Returns search suggestions' })
  async getSuggestions(@Request() req, @Query() query: SuggestionQueryDto): Promise<SuggestionResponse[]> {
    return this.suggestionService.getSuggestions(req.user.id, query);
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get available search facets' })
  @ApiResponse({ status: 200, description: 'Returns available facets' })
  async getFacets() {
    return {
      types: ['message', 'profile', 'content'],
      categories: ['general', 'technical', 'social'],
      timeRanges: ['today', 'week', 'month', 'year'],
    };
  }
}
