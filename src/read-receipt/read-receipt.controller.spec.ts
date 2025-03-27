/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ReadReceiptController } from './read-receipt.controller';
import { ReadReceiptService } from './read-receipt.service';
import { ReadReceipt } from './entities/read-receipt.entity';
import { NotFoundException } from '@nestjs/common';

describe('ReadReceiptController', () => {
  let controller: ReadReceiptController;
  let service: ReadReceiptService;

  // Mock the ReadReceiptService
  const mockReadReceiptService = {
    markAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadReceiptController],
      providers: [
        {
          provide: ReadReceiptService,
          useValue: mockReadReceiptService,
        },
      ],
    }).compile();

    controller = module.get<ReadReceiptController>(ReadReceiptController);
    service = module.get<ReadReceiptService>(ReadReceiptService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('markAsRead', () => {
    it('should successfully mark a message as read', async () => {
      // Arrange
      const userId = 'user-id';
      const messageId = 'message-id';
      const mockReadReceipt: ReadReceipt = {
        id: 'read-receipt-id',
        reader: { id: userId, username: 'test-user' },
        messageId: { id: messageId, content: 'Hello world!' },
        readAt: new Date(),
      };

      // Mock the service call
      mockReadReceiptService.markAsRead.mockResolvedValue(mockReadReceipt);

      // Act
      const result = await controller.markAsRead(userId, messageId);

      // Assert
      expect(result).toEqual(mockReadReceipt);
      expect(mockReadReceiptService.markAsRead).toHaveBeenCalledWith(
        userId,
        messageId,
      );
    });

    it('should throw an error if message or user is not found', async () => {
      // Arrange
      const userId = 'invalid-user-id';
      const messageId = 'invalid-message-id';

      // Mock service to throw an error
      mockReadReceiptService.markAsRead.mockRejectedValue(
        new NotFoundException('User or Message not found'),
      );

      // Act & Assert
      await expect(controller.markAsRead(userId, messageId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockReadReceiptService.markAsRead).toHaveBeenCalledWith(
        userId,
        messageId,
      );
    });
  });
});
