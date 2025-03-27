import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { MessageRepository } from './repository/message.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
