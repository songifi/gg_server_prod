import { Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsJSON } from 'class-validator';

@Entity()
export class Event {
  @ApiProperty({
    description: 'The unique identifier of the event',
    example: 'f62e77f2-bf55-4d5b-bb93-9fef7d4248d2',
    type: String,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    description: 'The timestamp when the event was triggered',
    example: '2022-01-01T12:00:00Z',
    type: String,
  })
  @IsDate()
  timestamp: Date;

  @ApiProperty({
    description: 'Additional metadata for the event',
    example: '{"platform": "web", "browser": "Chrome"}',
    type: Object,
  })
  @IsJSON()
  metadata: any;
}
