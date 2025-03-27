import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../enum/message-type.enum'; // Importing the MessageType enum

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
    enum: MessageType, // Use the MessageType enum here
    description: 'Type of message',
  })
  messageType: MessageType; // Ensure the type is MessageType, not a string
}
