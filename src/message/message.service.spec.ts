/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { MessageRepository } from './repository/message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageType } from './enum/message-type.enum';

describe('MessageService', () => {
  let messageService: MessageService;
  let messageRepository: MessageRepository;

  const mockMessageRepository = {
    createMessage: jest.fn(),
    find: jest.fn(),
    findOneMessage: jest.fn(),
    updateMessage: jest.fn(),
    removeMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessageRepository,
          useValue: mockMessageRepository,
        },
      ],
    }).compile();

    messageService = module.get<MessageService>(MessageService);
    messageRepository = module.get<MessageRepository>(MessageRepository);
  });

  it('should be defined', () => {
    expect(messageService).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a message', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Hello, world!',
        senderId: 'user123',
        conversationId: 'conv456',
        messageType: MessageType.TEXT,
      };

      const createdMessage: MessageResponseDto = {
        id: '1',
        content: 'Hello, world!',
        senderId: 'user123',
        conversationId: 'conv456',
        timestamp: new Date(),
        messageType: MessageType.TEXT,
      };

      mockMessageRepository.createMessage.mockResolvedValue(createdMessage);

      const result = await messageService.create(createMessageDto);

      expect(result).toEqual(createdMessage);
      expect(mockMessageRepository.createMessage).toHaveBeenCalledWith(
        createMessageDto.content,
        createMessageDto.senderId,
        createMessageDto.conversationId,
        createMessageDto.messageType,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of messages', async () => {
      const messages: MessageResponseDto[] = [
        {
          id: '1',
          content: 'Hello, world!',
          senderId: 'user123',
          conversationId: 'conv456',
          timestamp: new Date(),
          messageType: MessageType.TEXT,
        },
      ];

      mockMessageRepository.find.mockResolvedValue(messages);

      const result = await messageService.findAll();

      expect(result).toEqual(messages);
      expect(mockMessageRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const messageId = '1';
      const message: MessageResponseDto = {
        id: messageId,
        content: 'Hello, world!',
        senderId: 'user123',
        conversationId: 'conv456',
        timestamp: new Date(),
        messageType: MessageType.TEXT,
      };

      mockMessageRepository.findOneMessage.mockResolvedValue(message);

      const result = await messageService.findOne(messageId);

      expect(result).toEqual(message);
      expect(mockMessageRepository.findOneMessage).toHaveBeenCalledWith(
        messageId,
      );
    });
  });

  describe('update', () => {
    it('should update and return a message', async () => {
      const messageId = '1';
      const updateMessageDto: UpdateMessageDto = {
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

      mockMessageRepository.updateMessage.mockResolvedValue(updatedMessage);

      const result = await messageService.update(messageId, updateMessageDto);

      expect(result).toEqual(updatedMessage);
      expect(mockMessageRepository.updateMessage).toHaveBeenCalledWith(
        messageId,
        updateMessageDto.content,
        updateMessageDto.messageType,
      );
    });
  });

  describe('remove', () => {
    it('should remove a message by ID', async () => {
      const messageId = '1';

      mockMessageRepository.removeMessage.mockResolvedValue(undefined);

      const result = await messageService.remove(messageId);

      expect(result).toBeUndefined();
      expect(mockMessageRepository.removeMessage).toHaveBeenCalledWith(
        messageId,
      );
    });
  });
});
