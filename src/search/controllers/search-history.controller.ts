import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistory } from '../entities/search-history.entity';
import { SearchFavorite } from '../entities/search-favorite.entity';

@ApiTags('search-history')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchHistoryController {
  constructor(
    @InjectRepository(SearchHistory)
    private searchHistoryRepository: Repository<SearchHistory>,
    @InjectRepository(SearchFavorite)
    private searchFavoriteRepository: Repository<SearchFavorite>,
  ) {}

  @Get('history')
  @ApiOperation({ summary: 'Get user\'s search history' })
  @ApiResponse({ status: 200, description: 'Returns search history' })
  async getHistory(@Request() req) {
    return this.searchHistoryRepository.find({
      where: { userId: req.user.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  @Delete('history/:id')
  @ApiOperation({ summary: 'Delete a search history entry' })
  @ApiResponse({ status: 200, description: 'History entry deleted' })
  async deleteHistory(@Request() req, @Param('id') id: string) {
    await this.searchHistoryRepository.delete({
      id,
      userId: req.user.id,
    });
    return { success: true };
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user\'s favorite searches' })
  @ApiResponse({ status: 200, description: 'Returns favorite searches' })
  async getFavorites(@Request() req) {
    return this.searchFavoriteRepository.find({
      where: { userId: req.user.id },
      order: { createdAt: 'DESC' },
    });
  }

  @Post('favorites')
  @ApiOperation({ summary: 'Add a search to favorites' })
  @ApiResponse({ status: 201, description: 'Search added to favorites' })
  async addFavorite(@Request() req, @Body() favorite: Partial<SearchFavorite>) {
    const newFavorite = this.searchFavoriteRepository.create({
      ...favorite,
      userId: req.user.id,
    });
    return this.searchFavoriteRepository.save(newFavorite);
  }

  @Delete('favorites/:id')
  @ApiOperation({ summary: 'Remove a search from favorites' })
  @ApiResponse({ status: 200, description: 'Favorite search removed' })
  async deleteFavorite(@Request() req, @Param('id') id: string) {
    await this.searchFavoriteRepository.delete({
      id,
      userId: req.user.id,
    });
    return { success: true };
  }
}
