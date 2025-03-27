import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the message',
  })
  id: string;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'Message content',
  })
  content: string;

  @ApiProperty({ example: 'user123', description: 'ID of the sender' })
  senderId: string;

  @ApiProperty({ example: 'conv456', description: 'ID of the conversation' })
  conversationId: string;

  @ApiProperty({
    example: '2025-03-27T12:00:00Z',
    description: 'Timestamp of the message',
  })
  timestamp: Date;

  @ApiProperty({
    example: 'text',
    enum: ['text', 'media', 'token-transfer'],
    description: 'Type of message',
  })
  messageType: 'text' | 'media' | 'token-transfer';
}
