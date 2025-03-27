/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageType } from './enum/message-type.enum';

describe('MessageController', () => {
  let messageController: MessageController;
  let messageService: MessageService;

  const mockMessageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    messageController = module.get<MessageController>(MessageController);
    messageService = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(messageController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message and return the created message', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Hello, how are you?',
        senderId: 'user123',
        conversationId: 'conv456',
        messageType: MessageType.TEXT, // Use the enum
      };

      const createdMessage: MessageResponseDto = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        content: 'Hello, how are you?',
        senderId: 'user123',
        conversationId: 'conv456',
        timestamp: new Date(),
        messageType: MessageType.TEXT,
      };

      mockMessageService.create.mockResolvedValue(createdMessage);

      const result = await messageController.create(createMessageDto);

      expect(result).toEqual(createdMessage);
      expect(mockMessageService.create).toHaveBeenCalledWith(createMessageDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of messages', async () => {
      const messages: MessageResponseDto[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          content: 'Hello, how are you?',
          senderId: 'user123',
          conversationId: 'conv456',
          timestamp: new Date(),
          messageType: MessageType.TEXT,
        },
      ];

      mockMessageService.findAll.mockResolvedValue(messages);

      const result = await messageController.findAll();

      expect(result).toEqual(messages);
      expect(mockMessageService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const messageId = '550e8400-e29b-41d4-a716-446655440000';
      const message: MessageResponseDto = {
        id: messageId,
        content: 'Hello, how are you?',
        senderId: 'user123',
        conversationId: 'conv456',
        timestamp: new Date(),
        messageType: MessageType.TEXT,
      };

      mockMessageService.findOne.mockResolvedValue(message);

      const result = await messageController.findOne(messageId);

      expect(result).toEqual(message);
      expect(mockMessageService.findOne).toHaveBeenCalledWith(messageId);
    });
  });

  describe('update', () => {
    it('should update a message and return the updated message', async () => {
      const messageId = '550e8400-e29b-41d4-a716-446655440000';
      const updateMessageDto = {
        content: 'Updated message content',
        messageType: MessageType.TEXT,
      };

      const updatedMessage: MessageResponseDto = {
        id: messageId,
        content: 'Updated message content',
        senderId: 'user123',
        conversationId: 'conv456',
        timestamp: new Date(),
        messageType: MessageType.TEXT,
      };

      mockMessageService.update.mockResolvedValue(updatedMessage);

      const result = await messageController.update(
        messageId,
        updateMessageDto,
      );

      expect(result).toEqual(updatedMessage);
      expect(mockMessageService.update).toHaveBeenCalledWith(
        messageId,
        updateMessageDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a message by ID', async () => {
      const messageId = '550e8400-e29b-41d4-a716-446655440000';

      mockMessageService.remove.mockResolvedValue(undefined);

      const result = await messageController.remove(messageId);

      expect(result).toBeUndefined();
      expect(mockMessageService.remove).toHaveBeenCalledWith(messageId);
    });
  });
});
