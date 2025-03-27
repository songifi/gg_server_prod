import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Display name of the user',
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({
    example: 'Full-stack developer and tech enthusiast.',
    description: 'Short bio',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;
}
