import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { User } from '../../users/entities/user.entity';

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ModerationReason {
  TOXIC = 'toxic',
  PROFANITY = 'profanity',
  INAPPROPRIATE_IMAGE = 'inappropriate_image',
  USER_REPORT = 'user_report',
}

@Entity('moderation_queue')
export class ModerationQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ModerationStatus, default: ModerationStatus.PENDING })
  status: ModerationStatus;

  @Column({ type: 'enum', enum: ModerationReason })
  reason: ModerationReason;

  @Column('float', { nullable: true })
  toxicityScore?: number;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column()
  messageId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignedModeratorId' })
  assignedModerator?: User;

  @Column({ nullable: true })
  assignedModeratorId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
