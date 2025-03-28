import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ProfileModule } from './profile/profile.module';
import { WalletModule } from './wallet/wallet.module';
import { ReadReceiptModule } from './read-receipt/read-receipt.module';
import { ConversationModule } from './conversation/conversation.module';
import { NotificationModule } from './notification/notification.module';
import { TokenModule } from './token/token.module';
import { NotificationPreferenceModule } from './notification-preference/notification-preference.module';
import { AnalyticsModule } from './analytics/analytics.module';

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
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    UsersModule,
    MessageModule,
    AuthModule,
    EmailModule,
    ProfileModule,
    WalletModule,
    ReadReceiptModule,
    ConversationModule,
    NotificationModule,
    TokenModule,
    NotificationPreferenceModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
