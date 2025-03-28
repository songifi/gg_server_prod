import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationParticipant } from './entities/conversation-participation.entity';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly conversationParticipantRepository: Repository<ConversationParticipant>,
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
}
