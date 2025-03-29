import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './users/users.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ProfileModule } from './profile/profile.module';
import { WalletModule } from './wallet/wallet.module';
import { ReadReceiptModule } from './read-receipt/read-receipt.module';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationsModule } from './notification/notification.module';
import { TokenModule } from './token/token.module';
import { NotificationPreferenceModule } from './notification-preference/notification-preference.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ModerationModule } from './moderation/moderation.module';
import { PresenceModule } from './presence/presence.module';
import { WebhookModule } from './webhook/webhook.module';
import { BullModule } from '@nestjs/bull';
import { MediaModule } from './media/media.module';
import { DataSyncModule } from './data-sync/data-sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: +configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        bucketName: configService.get('AWS_S3_BUCKET_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: configService.get('SEARCH_SUGGESTION_CACHE_TTL'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    MessageModule,
    AuthModule,
    EmailModule,
    ProfileModule,
    WalletModule,
    ReadReceiptModule,
    ConversationModule,
    NotificationsModule,
    TokenModule,
    NotificationPreferenceModule,
    AnalyticsModule,
    ModerationModule,
    PresenceModule,
    WebhookModule,
    MediaModule,
    DataSyncModule,
  ],
})
export class AppModule {}
