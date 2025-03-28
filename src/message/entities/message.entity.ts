import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { MessageType } from '../enum/message-type.enum';
import { ReadReceipt } from 'src/read-receipt/entities/read-receipt.entity';
import { ModerationQueue } from '../../moderation/entities/moderation-queue.entity';

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

  @Column({ default: false })
  isModerated: boolean;

  @Column({ nullable: true })
  moderationNotes?: string;

  @OneToOne(() => ModerationQueue, (queue) => queue.message, { nullable: true })
  moderationQueue?: ModerationQueue;

  @CreateDateColumn()
  timestamp: Date;

  @OneToMany(() => ReadReceipt, (readReceipt) => readReceipt.message)
  readReceipts: ReadReceipt[];
}
