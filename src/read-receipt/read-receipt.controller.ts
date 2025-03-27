import { Controller, Post, Param } from '@nestjs/common';
import { ReadReceiptService } from './read-receipt.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ReadReceipt } from './entities/read-receipt.entity'; // Adjust path as needed

@Controller('read-receipts')
export class ReadReceiptController {
  constructor(private readonly readReceiptService: ReadReceiptService) {}

  @Post(':userId/:messageId')
  @ApiOperation({
    summary: 'Mark a message as read by a user',
    description: 'This endpoint allows a user to mark a message as read.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'The ID of the user who is reading the message',
  })
  @ApiParam({
    name: 'messageId',
    type: String,
    description: 'The ID of the message being marked as read',
  })
  @ApiResponse({
    status: 200,
    description: 'The message was successfully marked as read.',
    type: ReadReceipt, // This indicates the response will return a ReadReceipt entity
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or failed to mark message as read.',
  })
  async markAsRead(
    @Param('userId') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.readReceiptService.markAsRead(userId, messageId);
  }
}
