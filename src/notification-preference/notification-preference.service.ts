import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private notificationPreferenceRepository: Repository<NotificationPreference>,
  ) {}

  async create(
    createDto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = this.notificationPreferenceRepository.create(createDto);
    return this.notificationPreferenceRepository.save(preference);
  }

  async update(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = await this.notificationPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      throw new NotFoundException(
        'Notification preferences not found for this user',
      );
    }

    Object.assign(preference, updateDto);
    return this.notificationPreferenceRepository.save(preference);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    const preference = await this.notificationPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      throw new NotFoundException(
        'Notification preferences not found for this user',
      );
    }

    return preference;
  }

  async filterNotifications(
    userId: string,
    notifications: any[],
  ): Promise<any[]> {
    const preferences = await this.getPreferences(userId);
    return notifications.filter((notification) => {
      if (notification.type === 'email' && !preferences.emailEnabled)
        return false;
      if (notification.type === 'sms' && !preferences.smsEnabled) return false;
      if (notification.type === 'push' && !preferences.pushEnabled)
        return false;
      if (notification.type === 'inApp' && !preferences.inAppEnabled)
        return false;
      return true;
    });
  }
}
