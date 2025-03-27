import { MessageType } from '../enum/message-type.enum';

export interface IMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  messageType: MessageType;
  timestamp: Date;
}
