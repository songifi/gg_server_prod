import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username (4-20 characters)',
  })
  @IsString()
  @Length(4, 20)
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'User password (6-20 characters)',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20)
  password: string;

  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Display name of the user (Optional)',
  })
  @IsOptional()
  @IsString()
  @Length(3, 50)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL (Optional)',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    example: 'Full-stack developer and tech enthusiast.',
    description: 'Short bio (Optional, max 500 characters)',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  bio?: string;
}
