import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from './notification.service';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('sendPushNotification')
  async handlePushNotification(
    job: Job<{
      notificationId: string;
      userId: string;
      title: string;
      body: string;
      data?: Record<string, string>;
    }>,
  ) {
    this.logger.debug(`Processing notification job ${job.id}`);
    try {
      await this.notificationsService.sendPushNotification(
        job.data.userId,
        job.data.title,
        job.data.body,
        job.data.data,
      );
      this.logger.debug(`Successfully sent notification ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
