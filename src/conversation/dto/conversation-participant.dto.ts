import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConversationParticipantDto {
  @ApiProperty({
    description: 'Participant ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID of the participant',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Conversation ID that the participant belongs to',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsString()
  conversationId: string;
}
