import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity()
export class ReadReceipt {
  @ApiProperty({
    description: 'Unique identifier for the read receipt',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'User who has read the message',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.readReceipts, { onDelete: 'CASCADE' })
  reader: User;

  @ApiProperty({
    description: 'The message associated with the read receipt',
    type: () => Message,
  })
  @ManyToOne(() => Message, (message) => message.readReceipts, {
    onDelete: 'CASCADE',
  })
  message: Message;

  @ApiProperty({
    description: 'Timestamp when the message was read',
    example: '2025-03-27T12:00:00.000Z',
  })
  @CreateDateColumn()
  readAt: Date;

  @ApiProperty({
    description: 'User associated with the read receipt',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.readReceipts, { onDelete: 'CASCADE' })
  user: User;
}
