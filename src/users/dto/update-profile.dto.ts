import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsUrl, IsEmail, Matches } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Unique username',
  })
  @IsOptional()
  @IsString()
  @Length(3, 20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

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
