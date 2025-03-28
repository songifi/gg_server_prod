import { Controller, Post, Patch, Body, Param } from '@nestjs/common';
import { NotificationPreferenceService } from './notification-preference.service';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { NotificationPreference } from './entities/notification-preference.entity';

@Controller('notification-preferences')
export class NotificationPreferenceController {
  constructor(
    private readonly notificationPreferenceService: NotificationPreferenceService,
  ) {}

  @Post()
  create(
    @Body() createDto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    return this.notificationPreferenceService.create(createDto);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    return this.notificationPreferenceService.update(userId, updateDto);
  }
}
