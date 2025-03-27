import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageService } from 'src/message/message.service';
import { ReadReceiptRepository } from './repository/read-receipt.repository';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ReadReceiptService {
  constructor(
    @InjectRepository(ReadReceiptRepository)
    private readonly readReceiptRepository: ReadReceiptRepository,
    private readonly messageService: MessageService,
    private readonly userService: UsersService,
  ) {}

  async markAsRead(userId: string, messageId: string) {
    const user = await this.userService.findOne(userId);
    const message = await this.messageService.findOne(messageId);

    // Prevent duplicate read receipts
    const existingReceipt = await this.readReceiptRepository.findOne({
      where: { reader: user, message },
    });

    if (!existingReceipt) {
      const readReceipt = this.readReceiptRepository.create({
        reader: user,
        message,
      });
      return this.readReceiptRepository.save(readReceipt);
    }
    return existingReceipt;
  }
}
