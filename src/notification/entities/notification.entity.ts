import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enum/notification.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the notification' })
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  @ApiProperty({ description: 'User associated with the notification' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @ApiProperty({
    enum: NotificationType,
    description: 'Type of the notification',
  })
  type: NotificationType;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Content of the notification' })
  content: string;

  @Column({ default: false })
  @ApiProperty({
    description: 'Indicates whether the notification has been read',
  })
  isRead: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the notification was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Timestamp when the notification was last updated',
  })
  updatedAt: Date;
}
