/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participation.entity';
import { Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

describe('ConversationService', () => {
  let service: ConversationService;
  let conversationRepository: Repository<Conversation>;
  let conversationParticipantRepository: Repository<ConversationParticipant>;

  const mockConversationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const mockConversationParticipantRepository = {
    // You can mock methods from conversationParticipantRepository if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(ConversationParticipant),
          useValue: mockConversationParticipantRepository,
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    conversationRepository = module.get<Repository<Conversation>>(
      getRepositoryToken(Conversation),
    );
    conversationParticipantRepository = module.get<
      Repository<ConversationParticipant>
    >(getRepositoryToken(ConversationParticipant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a conversation', async () => {
      const createConversationDto: CreateConversationDto = {
        type: 'group', // or 'direct'
        title: 'New Conversation',
      };
      const result = { id: '1', ...createConversationDto };
      mockConversationRepository.create.mockReturnValue(result);
      mockConversationRepository.save.mockResolvedValue(result);

      expect(await service.create(createConversationDto)).toEqual(result);
    });
  });

  describe('findOne', () => {
    it('should return a conversation by ID', async () => {
      const id = '1';
      const result = { id, type: 'group', title: 'Existing Conversation' };
      mockConversationRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(id)).toEqual(result);
    });

    it('should return null if no conversation is found', async () => {
      const id = '1';
      mockConversationRepository.findOne.mockResolvedValue(null);

      expect(await service.findOne(id)).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return a conversation', async () => {
      const id = '1';
      const updateConversationDto: UpdateConversationDto = {
        type: 'direct',
        title: 'Updated Conversation',
      };
      const result = { id, ...updateConversationDto };
      mockConversationRepository.update.mockResolvedValue({ affected: 1 });
      mockConversationRepository.findOne.mockResolvedValue(result);

      expect(await service.update(id, updateConversationDto)).toEqual(result);
    });

    it('should return null if update fails', async () => {
      const id = '1';
      const updateConversationDto: UpdateConversationDto = {
        type: 'direct',
        title: 'Updated Conversation',
      };
      mockConversationRepository.update.mockResolvedValue({ affected: 0 });

      expect(await service.update(id, updateConversationDto)).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete a conversation', async () => {
      const id = '1';
      mockConversationRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(id);
      expect(mockConversationRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should not delete if no conversation is found', async () => {
      const id = '1';
      mockConversationRepository.delete.mockResolvedValue({ affected: 0 });

      await service.remove(id);
      expect(mockConversationRepository.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('findAll', () => {
    it('should return all conversations', async () => {
      const result = [
        { id: '1', type: 'group', title: 'Group Chat 1' },
        { id: '2', type: 'direct', title: 'Direct Chat 1' },
      ];
      mockConversationRepository.find.mockResolvedValue(result);

      expect(await service.findAll()).toEqual(result);
    });

    it('should return an empty array if no conversations exist', async () => {
      mockConversationRepository.find.mockResolvedValue([]);

      expect(await service.findAll()).toEqual([]);
    });
  });
});
