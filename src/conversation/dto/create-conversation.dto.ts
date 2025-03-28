import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConversationType } from '../enum/conversation-type.enum';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Type of the conversation (direct or group)',
    enum: ['direct', 'group'],
    example: 'group',
  })
  @IsEnum(['direct', 'group'])
  type: ConversationType;

  @ApiProperty({
    description: 'Title of the conversation (only for group conversations)',
    example: 'Tech Enthusiasts Group',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
}

export class ConversationDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of the conversation',
    enum: ['direct', 'group'],
    example: 'group',
  })
  type: ConversationType;

  @ApiProperty({
    description: 'Title of the conversation (only for group conversations)',
    example: 'Tech Enthusiasts Group',
    required: false,
  })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Participants in the conversation',
    type: [String], // You can define another DTO for participant details if needed
  })
  participants: string[];

  @ApiProperty({
    description: 'Timestamp when the conversation was created',
    example: '2025-03-27T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the conversation was last updated',
    example: '2025-03-27T12:30:00.000Z',
  })
  updatedAt: Date;
}
