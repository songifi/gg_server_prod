import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { MessageType } from '../enum/message-type.enum';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  senderId: string;

  @Column()
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MessageType,
  })
  messageType: MessageType;

  @CreateDateColumn()
  timestamp: Date;
}
