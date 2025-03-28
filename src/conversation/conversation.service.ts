import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationParticipant, ConversationParticipantRole } from './entities/conversation-participation.entity';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
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
}
