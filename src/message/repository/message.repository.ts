import { EntityRepository, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { MessageType } from '../enum/message-type.enum';
import { MessageReadReceipt } from '../../read-receipt/dto/message-read-receipt.entity';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  private readonly logger = new Logger('MessageRepository');

  async createMessage(
    content: string,
    senderId: string,
    conversationId: string,
    messageType: string,
  ) {
    try {
      const message = this.create({
        content,
        senderId,
        conversationId,
        messageType:
          MessageType[messageType.toUpperCase() as keyof typeof MessageType],
      });
      const savedMessage = await this.save(message);
      this.logger.log(`Message created: ${savedMessage.id}`);
      return savedMessage;
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findMessagesByConversation(conversationId: string) {
    try {
      const messages = await this.find({
        where: { conversationId },
        order: { timestamp: 'ASC' },
      });
      this.logger.debug(
        `Found ${messages.length} messages for conversation ${conversationId}`,
      );
      return messages;
    } catch (error) {
      this.logger.error(
        `Failed to find messages for conversation ${conversationId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOneMessage(id: string) {
    try {
      const message = await this.findOne({ where: { id } });
      if (!message) {
        this.logger.warn(`Message not found: ${id}`);
      }
      return message;
    } catch (error) {
      this.logger.error(
        `Failed to find message ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateMessage(id: string, content: string, messageType: string) {
    try {
      const message = await this.findOneMessage(id);
      if (!message) {
        this.logger.warn(`Cannot update non-existent message: ${id}`);
        return null;
      }
      message.content = content;
      message.messageType =
        MessageType[messageType.toUpperCase() as keyof typeof MessageType];
      const updatedMessage = await this.save(message);
      this.logger.log(`Message updated: ${id}`);
      return updatedMessage;
    } catch (error) {
      this.logger.error(
        `Failed to update message ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async removeMessage(id: string) {
    try {
      await this.delete(id);
      this.logger.log(`Message deleted: ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete message ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findUserConversations(userId: string) {
    try {
      const conversations = await this.createQueryBuilder('message')
        .select('DISTINCT message.conversationId', 'id')
        .where('message.senderId = :userId', { userId })
        .orWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('m.conversationId')
            .from('messages', 'm')
            .where('m.senderId = :userId', { userId })
            .getQuery();
          return 'message.conversationId IN ' + subQuery;
        })
        .getRawMany();
      this.logger.debug(
        `Found ${conversations.length} conversations for user ${userId}`,
      );
      return conversations;
    } catch (error) {
      this.logger.error(
        `Failed to find conversations for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string) {
    try {
      const message = await this.findOneMessage(messageId);
      if (!message) {
        this.logger.warn(
          `Cannot mark non-existent message as read: ${messageId}`,
        );
        return null;
      }

      const readReceipt = new MessageReadReceipt();
      readReceipt.messageId = messageId;
      readReceipt.userId = userId;

      await this.manager.getRepository(MessageReadReceipt).save(readReceipt);
      this.logger.log(`Message ${messageId} marked as read by user ${userId}`);

      return message;
    } catch (error) {
      this.logger.error(
        `Failed to mark message ${messageId} as read: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
