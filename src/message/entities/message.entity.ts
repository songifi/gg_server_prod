import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { MessageType } from '../enum/message-type.enum';
import { ReadReceipt } from 'src/read-receipt/entities/read-receipt.entity';

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

  @OneToMany(() => ReadReceipt, (readReceipt) => readReceipt.message)
  readReceipts: ReadReceipt[];
}
