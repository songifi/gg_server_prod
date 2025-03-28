import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationParticipant } from './conversation-participation.entity';
import { ConversationType } from '../enum/conversation-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity('conversations')
export class Conversation {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
    example: 'b3f64c9a-4c45-47f9-bc6a-217cae6d26f3',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Type of conversation',
    enum: ['direct', 'group'],
    example: 'direct',
  })
  @Column({
    type: 'enum',
    enum: ['direct', 'group'],
  })
  type: ConversationType;

  @ApiProperty({
    description: 'Title of the conversation (Only for group conversations)',
    example: 'Team Discussion',
    nullable: true,
  })
  @Column({ nullable: true })
  title: string;

  @ApiProperty({
    description: 'List of participants in the conversation',
    type: () => [ConversationParticipant],
  })
  @OneToMany(
    () => ConversationParticipant,
    (participant) => participant.conversation,
  )
  participants: ConversationParticipant[];

  @ApiProperty({
    description: 'Timestamp when the conversation was created',
    example: '2024-03-27T12:45:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the conversation was last updated',
    example: '2024-03-28T14:20:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
