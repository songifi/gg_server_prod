import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { WebhookService } from './webhook.service';
import { WebhookEvent } from './enum/webhook-event.enum';

@Processor('webhook')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Process('sendWebhook')
  async handleWebhook(job: Job<{ webhookId: string; event: WebhookEvent; payload: any }>) {
    this.logger.debug(`Processing webhook job ${job.id}`);
    try {
      await this.webhookService.processWebhook(
        job.data.webhookId,
        job.data.event,
        job.data.payload,
      );
      this.logger.debug(`Successfully processed webhook job ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process webhook job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
