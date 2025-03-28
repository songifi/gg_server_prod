import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Import Swagger decorator
import { IsBoolean, IsUUID } from 'class-validator'; // Import class-validator decorators

@Entity()
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Unique identifier for the notification preference',
    example: '9b5cbfe2-6f83-4ec3-bfc1-0f0e6b2b2d90',
  })
  id: string;

  @Column()
  @ApiProperty({
    description: 'The ID of the user this notification preference belongs to',
    example: '9b5cbfe2-6f83-4ec3-bfc1-0f0e6b2b2d90',
  })
  @IsUUID()
  userId: string;

  @Column({ default: true })
  @ApiProperty({
    description: 'Whether email notifications are enabled',
    example: true,
  })
  @IsBoolean()
  emailEnabled: boolean;

  @Column({ default: true })
  @ApiProperty({
    description: 'Whether SMS notifications are enabled',
    example: true,
  })
  @IsBoolean()
  smsEnabled: boolean;

  @Column({ default: true })
  @ApiProperty({
    description: 'Whether push notifications are enabled',
    example: true,
  })
  @IsBoolean()
  pushEnabled: boolean;

  @Column({ default: true })
  @ApiProperty({
    description: 'Whether in-app notifications are enabled',
    example: true,
  })
  @IsBoolean()
  inAppEnabled: boolean;
}
