import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '../../message/entities/message.entity';
import { ReadReceipt } from 'src/read-receipt/entities/read-receipt.entity';

@Entity('message_read_receipts')
export class MessageReadReceipt {
  @ApiProperty({
    description: 'Unique identifier for the message read receipt',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the message associated with the read receipt',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column()
  messageId: string;

  @ApiProperty({
    description: 'ID of the user who has read the message',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column()
  userId: string;

  @ApiProperty({
    description: 'Timestamp of when the message was read',
    example: '2025-03-27T12:00:00.000Z',
  })
  @CreateDateColumn()
  readAt: Date;

  @ApiProperty({
    description: 'The message associated with the read receipt',
    type: () => Message,
  })
  @ManyToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @ApiProperty({
    description: 'List of read receipts for the message',
    type: () => [ReadReceipt],
    nullable: true,
  })
  @OneToMany(() => ReadReceipt, (readReceipt) => readReceipt.message)
  readReceipts: ReadReceipt[];
}
