/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

describe('ConversationController', () => {
  let controller: ConversationController;
  let service: ConversationService;

  const mockConversationService = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: mockConversationService,
        },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
    service = module.get<ConversationService>(ConversationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const createConversationDto: CreateConversationDto = {
        type: 'group', // or 'direct'
        title: 'New Group Chat',
      };
      const result = { id: '1', ...createConversationDto };
      mockConversationService.create.mockResolvedValue(result);

      expect(await controller.create(createConversationDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const id = '1';
      const result = { id, type: 'group', title: 'Existing Conversation' };
      mockConversationService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(id)).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a conversation by ID', async () => {
      const id = '1';
      const updateConversationDto: UpdateConversationDto = {
        type: 'direct', // or 'group'
        title: 'Updated Conversation',
      };
      const result = { id, ...updateConversationDto };
      mockConversationService.update.mockResolvedValue(result);

      expect(await controller.update(id, updateConversationDto)).toEqual(
        result,
      );
    });
  });

  describe('remove', () => {
    it('should delete a conversation by ID', async () => {
      const id = '1';
      mockConversationService.remove.mockResolvedValue(undefined);

      expect(await controller.remove(id)).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const result = [
        { id: '1', type: 'group', title: 'Group Chat 1' },
        { id: '2', type: 'direct', title: 'Direct Chat 1' },
      ];
      mockConversationService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
    });
  });
});
