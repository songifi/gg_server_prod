import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SuggestionQueryDto {
  @ApiProperty({ description: 'Partial query for typeahead suggestions' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Maximum number of suggestions', default: 5 })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  limit?: number = 5;

  @ApiProperty({ description: 'Include personalized suggestions', default: true })
  @IsOptional()
  personalized?: boolean = true;
}
