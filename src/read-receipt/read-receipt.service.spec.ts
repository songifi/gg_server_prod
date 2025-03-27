import { Test, TestingModule } from '@nestjs/testing';
import { ReadReceiptService } from './read-receipt.service';
import { ReadReceiptRepository } from './repository/read-receipt.repository';
import { MessageService } from 'src/message/message.service';
import { UsersService } from 'src/users/users.service';

describe('ReadReceiptService', () => {
  let service: ReadReceiptService;
  let mockReadReceiptRepo;
  let mockMessageService;
  let mockUserService;

  beforeEach(async () => {
    mockReadReceiptRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    mockMessageService = { findOne: jest.fn() };
    mockUserService = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReadReceiptService,
        { provide: ReadReceiptRepository, useValue: mockReadReceiptRepo },
        { provide: MessageService, useValue: mockMessageService },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<ReadReceiptService>(ReadReceiptService);
  });

  it('should mark a message as read', async () => {
    const userId = 'user123';
    const messageId = 'message456';
    const mockUser = { id: userId };
    const mockMessage = { id: messageId };
    const mockReceipt = {
      id: 'receipt789',
      reader: mockUser,
      message: mockMessage,
    };

    mockUserService.findOne.mockResolvedValue(mockUser);
    mockMessageService.findOne.mockResolvedValue(mockMessage);
    mockReadReceiptRepo.findOne.mockResolvedValue(null);
    mockReadReceiptRepo.create.mockReturnValue(mockReceipt);
    mockReadReceiptRepo.save.mockResolvedValue(mockReceipt);

    const result = await service.markAsRead(userId, messageId);

    expect(result).toEqual(mockReceipt);
    expect(mockReadReceiptRepo.create).toHaveBeenCalledWith({
      reader: mockUser,
      message: mockMessage,
    });
    expect(mockReadReceiptRepo.save).toHaveBeenCalledWith(mockReceipt);
  });
});
