import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageRepository } from './repository/message.repository';

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
}
