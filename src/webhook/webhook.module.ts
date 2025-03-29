import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookConfig } from './entities/webhook-config.entity';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { WebhookProcessor } from './webhook.processor';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookConfig]),
    BullModule.registerQueue({
      name: 'webhook',
    }),
    ConfigModule,
  ],
  providers: [WebhookService, WebhookProcessor],
  controllers: [WebhookController],
  exports: [WebhookService],
})
export class WebhookModule {}
