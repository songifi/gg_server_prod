import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { MessageType } from '../enum/message-type.enum';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'Message content',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the sender',
  })
  @IsUUID()
  senderId: string;

  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j-123456789abc',
    description: 'ID of the conversation',
  })
  @IsUUID()
  conversationId: string;

  @ApiProperty({
    example: 'text',
    enum: MessageType, // Use the MessageType enum here
    description: 'Type of message',
  })
  @IsEnum(MessageType)
  messageType: MessageType;
}
