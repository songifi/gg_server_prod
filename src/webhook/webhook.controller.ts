import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { WebhookEvent } from './enum/webhook-event.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('webhooks')
@Controller('webhooks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new webhook configuration' })
  async createWebhook(
    @GetUser() user: User,
    @Body() data: { url: string; events: WebhookEvent[] },
  ) {
    return this.webhookService.createWebhook(user.id, data.url, data.events);
  }
}
