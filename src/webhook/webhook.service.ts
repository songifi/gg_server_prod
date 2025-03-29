import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { WebhookConfig } from './entities/webhook-config.entity';
import { WebhookEvent } from './enum/webhook-event.enum';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookConfig)
    private webhookConfigRepository: Repository<WebhookConfig>,
    @InjectQueue('webhook')
    private webhookQueue: Queue,
  ) {}

  async createWebhook(userId: string, url: string, events: WebhookEvent[]): Promise<WebhookConfig> {
    const secret = crypto.randomBytes(32).toString('hex');
    const webhook = this.webhookConfigRepository.create({
      userId,
      url,
      events,
      secret,
    });
    return this.webhookConfigRepository.save(webhook);
  }

  async dispatchEvent(event: WebhookEvent, payload: any) {
    const webhooks = await this.webhookConfigRepository.find({
      where: { isActive: true },
    });

    for (const webhook of webhooks) {
      if (webhook.events.includes(event)) {
        await this.webhookQueue.add('sendWebhook', {
          webhookId: webhook.id,
          event,
          payload,
        });
      }
    }
  }

  private generateSignature(secret: string, payload: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  async processWebhook(webhookId: string, event: WebhookEvent, payload: any) {
    const webhook = await this.webhookConfigRepository.findOne({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      return;
    }

    const timestamp = Date.now().toString();
    const body = JSON.stringify({
      event,
      payload,
      timestamp,
    });

    const signature = this.generateSignature(webhook.secret, body);

    try {
      await axios.post(webhook.url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-Timestamp': timestamp,
        },
        timeout: 5000,
      });

      webhook.failedAttempts = 0;
      webhook.lastFailure = null;
      await this.webhookConfigRepository.save(webhook);
    } catch (error) {
      webhook.failedAttempts += 1;
      webhook.lastFailure = new Date();
      
      if (webhook.failedAttempts >= 10) {
        webhook.isActive = false;
      }
      
      await this.webhookConfigRepository.save(webhook);
      throw error;
    }
  }
}
