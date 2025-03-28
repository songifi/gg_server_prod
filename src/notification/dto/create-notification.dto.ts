import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsBoolean, IsString } from 'class-validator';
import { NotificationType } from '../enum/notification.enum';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsEnum(NotificationType)
  @ApiProperty({
    enum: NotificationType,
    description: 'Type of the notification',
  })
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Content of the notification',
  })
  content: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates whether the notification has been read',
    default: false,
  })
  isRead: boolean;

  @IsNotEmpty()
  @ApiProperty({ description: 'User associated with the notification' })
  userId: string;
}
