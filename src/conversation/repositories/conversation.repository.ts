import { EntityRepository, Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';

@EntityRepository(Conversation)
export class ConversationRepository extends Repository<Conversation> {}
