import { IsString, IsOptional, IsInt, Min, Max, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query string' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Page number for pagination', default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: 'Results per page', default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({ description: 'Facet filters', required: false })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Include social signals in ranking', default: true })
  @IsOptional()
  includeSocial?: boolean = true;

  @ApiProperty({ description: 'Content types to search', required: false })
  @IsOptional()
  types?: ('message' | 'profile' | 'content')[] = ['message', 'profile', 'content'];
}
