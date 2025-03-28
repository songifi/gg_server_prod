import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ConversationSortType {
  RECENT = 'recent',
  UNREAD = 'unread',
}

export class ListConversationsDto {
  @ApiPropertyOptional({
    enum: ConversationSortType,
    description: 'Sort conversations by recent or unread',
    default: ConversationSortType.RECENT,
  })
  @IsOptional()
  @IsEnum(ConversationSortType)
  sort?: ConversationSortType = ConversationSortType.RECENT;

  @ApiPropertyOptional({
    description: 'Search keyword in conversation messages',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
