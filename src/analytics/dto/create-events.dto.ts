import { IsString, IsOptional, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'The name of the event',
    example: 'user_signup',
    type: String,
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: 'The ID of the user triggering the event',
    example: '12345',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Additional metadata for the event',
    example: '{"platform": "web", "browser": "Chrome"}',
    type: Object,
  })
  @IsJSON()
  metadata: any;
}
