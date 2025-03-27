import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('conversation_participants')
export class ConversationParticipant {
  @ApiProperty({
    description: 'Unique identifier for the conversation participant',
    example: 'b3f64c9a-4c45-47f9-bc6a-217cae6d26f3',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The conversation this participant is part of' })
  @ManyToOne(() => Conversation, (conversation) => conversation.participants)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ApiProperty({ description: 'The user participating in this conversation' })
  @ManyToOne(() => User, (user) => user.conversations)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
