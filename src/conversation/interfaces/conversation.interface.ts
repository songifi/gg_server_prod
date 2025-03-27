import { CreateConversationDto } from '../dto/create-conversation.dto';
import { UpdateConversationDto } from '../dto/update-conversation.dto';
import { Conversation } from '../entities/conversation.entity';

export interface IConversationService {
  create(createConversationDto: CreateConversationDto): Promise<Conversation>;
  findOne(id: string): Promise<Conversation>;
  update(
    id: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation>;
  remove(id: string): Promise<void>;
  findAll(): Promise<Conversation[]>;
}
