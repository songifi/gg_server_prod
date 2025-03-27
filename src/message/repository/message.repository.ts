import { EntityRepository, Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { MessageType } from '../enum/message-type.enum'; // Import MessageType Enum

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  async createMessage(
    content: string,
    senderId: string,
    conversationId: string,
    messageType: string, // Should be a MessageType enum value
  ) {
    // Cast messageType to MessageType enum
    const message = this.create({
      content,
      senderId,
      conversationId,
      messageType:
        MessageType[messageType.toUpperCase() as keyof typeof MessageType],
    });
    return await this.save(message);
  }

  async findMessagesByConversation(conversationId: string) {
    return await this.find({
      where: { conversationId },
      order: { timestamp: 'ASC' },
    });
  }

  async findOneMessage(id: string) {
    return await this.findOne({ where: { id } });
  }

  async updateMessage(id: string, content: string, messageType: string) {
    await this.update(id, {
      content,
      messageType:
        MessageType[messageType.toUpperCase() as keyof typeof MessageType],
    });
    return await this.findOne({ where: { id } });
  }

  async removeMessage(id: string) {
    await this.delete(id);
  }
}
