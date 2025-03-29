import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum DevicePlatform {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the device token' })
  id: string;

  @Column()
  @Index()
  @ApiProperty({ description: 'User ID associated with the device token' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @ApiProperty({ description: 'The device token for push notifications' })
  token: string;

  @Column({
    type: 'enum',
    enum: DevicePlatform,
  })
  @ApiProperty({
    enum: DevicePlatform,
    description: 'Platform of the device (iOS, Android, Web)',
  })
  platform: DevicePlatform;

  @Column({ default: true })
  @ApiProperty({ description: 'Whether the device token is active' })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty({ description: 'Additional device metadata' })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  @ApiProperty({ description: 'Timestamp when the device token was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Timestamp when the device token was last updated' })
  updatedAt: Date;
}
