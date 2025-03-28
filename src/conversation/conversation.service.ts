import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConversationParticipant,
  ConversationParticipantRole,
} from './entities/conversation-participation.entity';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import {
  ListConversationsDto,
  ConversationSortType,
} from './dto/list-conversations.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create(
      createConversationDto,
    );
    return this.conversationRepository.save(conversation);
  }

  async findOne(id: string): Promise<Conversation> {
    return this.conversationRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    await this.conversationRepository.update(id, updateConversationDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.conversationRepository.delete(id);
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversationRepository.find();
  }

  async getParticipant(
    conversationId: string,
    userId: string,
  ): Promise<ConversationParticipant | null> {
    return this.participantRepository.findOne({
      where: {
        conversation: { id: conversationId },
        user: { id: userId },
      },
      relations: ['user', 'conversation'],
    });
  }

  async addParticipant(
    conversationId: string,
    dto: AddParticipantDto,
  ): Promise<ConversationParticipant> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingParticipant = await this.getParticipant(
      conversationId,
      dto.userId,
    );

    if (existingParticipant) {
      throw new BadRequestException('User is already a participant');
    }

    const participant = this.participantRepository.create({
      conversation,
      user,
      role: dto.role || ConversationParticipantRole.MEMBER,
    });

    return this.participantRepository.save(participant);
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const participant = await this.getParticipant(conversationId, userId);

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await this.participantRepository.remove(participant);
  }

  async listConversations(userId: string, dto: ListConversationsDto) {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Normalize pagination parameters
    const page = Math.max(1, dto.page || 1);
    const limit = Math.min(100, Math.max(1, dto.limit || 10));

    // Sanitize search input
    const search = dto.search?.trim();

    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect(
        (subQuery) => {
          return subQuery
            .select('message.*')
            .from('messages', 'message')
            .where(
              'message.id IN (SELECT MAX(m2.id) FROM messages m2 WHERE m2.conversation_id = message.conversation_id GROUP BY m2.conversation_id)',
            );
        },
        'lastMessage',
        'lastMessage.conversation_id = conversation.id',
      )
      .where('participants.user.id = :userId', { userId });

    // Apply search filter if provided
    if (search) {
      query.andWhere(
        '(LOWER(lastMessage.content) LIKE LOWER(:search) OR LOWER(user.name) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    if (dto.sort === ConversationSortType.UNREAD) {
      query.orderBy('lastMessage.read', 'ASC');
    }
    query.addOrderBy('lastMessage.createdAt', 'DESC');

    // Get total count
    const total = await query.getCount();

    // Get paginated results
    const conversations = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: conversations,
      total,
      page,
      limit,
      hasMore: total > page * limit,
    };
  }
}
