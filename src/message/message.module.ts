import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { MessageRepository } from './repository/message.repository';
import { MessageGateway } from './message.gateway';
import { MessageReadReceipt } from '../read-receipt/dto/message-read-receipt.entity';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageReadReceipt]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    ModerationModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
