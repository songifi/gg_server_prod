import { Module } from '@nestjs/common';
import { ReadReceiptService } from './read-receipt.service';
import { ReadReceiptController } from './read-receipt.controller';
import { ReadReceiptRepository } from './repository/read-receipt.repository';
import { ReadReceipt } from './entities/read-receipt.entity';
import { MessageReadReceipt } from './dto/message-read-receipt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageModule } from 'src/message/message.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MessageModule,
    UsersModule,
    TypeOrmModule.forFeature([ReadReceipt, MessageReadReceipt]),
  ],
  controllers: [ReadReceiptController],
  providers: [ReadReceiptService, ReadReceiptRepository],
  exports: [ReadReceiptService],
})
export class ReadReceiptModule {}
