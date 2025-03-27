import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { TypingDto } from './dto/typing.dto';
import { WsUser } from './decorators/ws-user.decorator';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedClients = new Map<string, Set<string>>();
  private readonly typingUsers = new Map<string, Set<string>>();
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly messageService: MessageService) {}

  async handleConnection(client: Socket) {
    try {
      // JWT validation is handled by WsJwtGuard
      const userId = client.handshake.auth.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Store client connection
      const userClients = this.connectedClients.get(userId) || new Set();
      userClients.add(client.id);
      this.connectedClients.set(userId, userClients);

      // Join user's conversation rooms
      const conversations = await this.messageService.getUserConversations(userId);
      conversations.forEach(conversation => {
        client.join(`conversation:${conversation.id}`);
      });

      // Broadcast user online status
      this.server.emit('userStatus', { userId, status: 'online' });

      // Clear disconnect timer if exists
      const timer = this.disconnectTimers.get(userId);
      if (timer) {
        clearTimeout(timer);
        this.disconnectTimers.delete(userId);
      }
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    // Remove client from connected clients
    const userClients = this.connectedClients.get(userId);
    if (userClients) {
      userClients.delete(client.id);
      if (userClients.size === 0) {
        // Start a timer to set user as offline
        const timer = setTimeout(() => {
          this.server.emit('userStatus', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
          this.connectedClients.delete(userId);
        }, 30000); // 30 seconds delay

        this.disconnectTimers.set(userId, timer);
      }
    }

    // Remove from typing indicators
    this.typingUsers.forEach((users, conversationId) => {
      if (users.delete(userId) && users.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @WsUser() userId: string,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    try {
      const message = await this.messageService.create({
        ...createMessageDto,
        senderId: userId,
      });

      // Broadcast to conversation room
      this.server
        .to(`conversation:${message.conversationId}`)
        .emit('newMessage', message);

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @WsUser() userId: string,
    @MessageBody() typingDto: TypingDto,
  ) {
    const { conversationId, isTyping } = typingDto;

    // Get or create typing users set for the conversation
    let typingUsers = this.typingUsers.get(conversationId);
    if (!typingUsers) {
      typingUsers = new Set();
      this.typingUsers.set(conversationId, typingUsers);
    }

    // Update typing status
    if (isTyping) {
      typingUsers.add(userId);
    } else {
      typingUsers.delete(userId);
    }

    // Broadcast typing status to conversation room
    this.server
      .to(`conversation:${conversationId}`)
      .emit('typing', { userId, isTyping });
  }
}
