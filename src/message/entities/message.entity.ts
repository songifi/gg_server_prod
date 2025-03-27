import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('messages')
export class Message {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the message',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'Message content',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 'user123', description: 'ID of the sender' })
  @Index()
  @Column()
  senderId: string;

  @ApiProperty({ example: 'conv456', description: 'ID of the conversation' })
  @Index()
  @Column()
  conversationId: string;

  @ApiProperty({
    example: '2025-03-27T12:00:00Z',
    description: 'Timestamp of the message',
  })
  @Index()
  @CreateDateColumn()
  timestamp: Date;

  @ApiProperty({
    example: 'text',
    enum: ['text', 'media', 'token-transfer'],
    description: 'Type of message',
  })
  @Column({ type: 'enum', enum: ['text', 'media', 'token-transfer'] })
  messageType: 'text' | 'media' | 'token-transfer';
}
