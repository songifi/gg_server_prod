import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('message_read_receipts')
export class MessageReadReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  messageId: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  readAt: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;
}
