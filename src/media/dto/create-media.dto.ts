import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUrl } from 'class-validator';

// Enum for Media Types (you can expand this if necessary)
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export class CreateMediaDto {
  @ApiProperty({ description: 'The URL of the uploaded media file' })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'The media type (image, video, audio)',
    enum: MediaType,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'Metadata including processing details',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateMediaDto {
  @ApiProperty({
    description: 'The URL of the uploaded media file',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'The media type (image, video, audio)',
    enum: MediaType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @ApiProperty({
    description: 'Metadata including processing details',
    required: false,
  })
  @IsOptional()
  metadata?: any;
}
