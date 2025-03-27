import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Whether to receive email notifications',
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to use dark mode',
  })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Preferred language',
    enum: ['en', 'fr', 'es'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'fr', 'es'])
  language?: string;
}
