import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageRepository } from './repository/message.repository';
import { Like } from 'typeorm';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageRepository)
    private readonly messageRepository: MessageRepository,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const { content, senderId, conversationId, messageType } = createMessageDto;
    const message = await this.messageRepository.createMessage(
      content,
      senderId,
      conversationId,
      messageType,
    );
    return message;
  }

  async findAll(): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepository.find();
    return messages;
  }

  async findOne(id: string): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findOneMessage(id);
    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepository.updateMessage(
      id,
      updateMessageDto.content,
      updateMessageDto.messageType,
    );
    return message;
  }

  async remove(id: string): Promise<void> {
    await this.messageRepository.removeMessage(id);
  }

  async getMessageHistory(
    senderId: string,
    conversationId: string,
    page: number,
    limit: number,
    filters?: { type?: string; startDate?: string; endDate?: string },
  ): Promise<{ messages: MessageResponseDto[]; total: number }> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where(
        'message.senderId = :senderId AND message.conversationId = :conversationId',
        { senderId, conversationId },
      );

    if (filters?.type) {
      query.andWhere('message.type = :type', { type: filters.type });
    }

    if (filters?.startDate) {
      query.andWhere('message.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('message.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const [messages, total] = await query
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { messages, total };
  }

  async searchMessages(
    query: string,
    senderId: string,
    conversationId: string,
  ): Promise<MessageResponseDto[]> {
    return this.messageRepository.find({
      where: {
        senderId,
        conversationId,
        content: Like(`%${query}%`),
      },
      order: { timestamp: 'DESC' as any },
    });
  }

  async getUserConversations(userId: string): Promise<{ id: string }[]> {
    return await this.messageRepository.findUserConversations(userId);
  }

  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<MessageResponseDto | null> {
    return await this.messageRepository.markMessageAsRead(messageId, userId);
  }
}
