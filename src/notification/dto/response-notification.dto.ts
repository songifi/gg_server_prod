import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../enum/notification.enum';
import { User } from '../../users/entities/user.entity';

export class NotificationResponseDto {
  @ApiProperty({ description: 'Unique identifier for the notification' })
  id: string;

  @ApiProperty({ description: 'User associated with the notification' })
  user: User;

  @ApiProperty({
    enum: NotificationType,
    description: 'Type of the notification',
  })
  type: NotificationType;

  @ApiProperty({ description: 'Content of the notification' })
  content: string;

  @ApiProperty({
    description: 'Indicates whether the notification has been read',
  })
  isRead: boolean;

  @ApiProperty({ description: 'Timestamp when the notification was created' })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the notification was last updated',
  })
  updatedAt: Date;
}
