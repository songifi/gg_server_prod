import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ModerationService } from '../services/moderation.service';
import { ImageModerationService } from '../services/image-moderation.service';
import { Message } from '../../message/entities/message.entity';
import { ModerationReason } from '../entities/moderation-queue.entity';

@Processor('moderation')
export class ModerationQueueProcessor {
  constructor(
    private readonly moderationService: ModerationService,
    private readonly imageModerationService: ImageModerationService,
  ) {}

  @Process('analyze-content')
  async analyzeContent(job: Job<{ messageId: string; content: string }>) {
    const { messageId, content } = job.data;

    try {
      const { shouldFlag, toxicityScore } = await this.moderationService.analyzeContent(
        content,
        messageId
      );

      if (shouldFlag) {
        await this.moderationService.queueForModeration(
          { id: messageId } as Message,
          ModerationReason.TOXIC,
          toxicityScore
        );
      }
    } catch (error) {
      console.error(`Failed to analyze content for message ${messageId}:`, error);
      throw error;
    }
  }

  @Process('analyze-image')
  async analyzeImage(job: Job<{ messageId: string; imageUrl: string }>) {
    const { messageId, imageUrl } = job.data;

    try {
      const result = await this.imageModerationService.analyzeImage(imageUrl);

      if (result.isInappropriate) {
        await this.moderationService.queueForModeration(
          { id: messageId } as Message,
          ModerationReason.INAPPROPRIATE_IMAGE
        );
      }
    } catch (error) {
      console.error(`Failed to analyze image for message ${messageId}:`, error);
      throw error;
    }
  }
}
