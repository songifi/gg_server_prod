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
import { WsUser } from '../message/decorators/ws-user.decorator';
import { PresenceService } from './services/presence.service';
import { UserPresence } from './types/presence.types';

interface TypingEvent {
  conversationId: string;
  isTyping: boolean;
}

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
@UseGuards(WsJwtGuard)
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly reconnectAttempts = new Map<string, number>();
  private readonly maxReconnectAttempts = 5;
  private readonly baseReconnectDelay = 1000; // 1 second

  constructor(private readonly presenceService: PresenceService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Reset reconnection attempts on successful connection
      this.reconnectAttempts.delete(userId);

      // Join user's room for presence updates
      client.join(`presence:${userId}`);

      // Update presence
      const presence = await this.presenceService.handleConnection(userId, client.id);
      
      // Notify others about the user's presence
      this.broadcastPresenceUpdate(presence);
    } catch (error) {
      console.error('Presence connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) return;

      // Handle reconnection attempts
      const attempts = (this.reconnectAttempts.get(userId) || 0) + 1;
      this.reconnectAttempts.set(userId, attempts);

      if (attempts <= this.maxReconnectAttempts) {
        // Exponential backoff
        const delay = this.baseReconnectDelay * Math.pow(2, attempts - 1);
        setTimeout(async () => {
          // Check if user has reconnected elsewhere
          const presence = await this.presenceService.getUsersPresence([userId]);
          if (!presence[userId] || presence[userId].deviceCount === 0) {
            await this.presenceService.handleDisconnection(userId, client.id);
            this.broadcastPresenceUpdate(presence[userId]);
          }
        }, delay);
      } else {
        // Max attempts reached, mark as offline
        await this.presenceService.handleDisconnection(userId, client.id);
        const presence = await this.presenceService.getUsersPresence([userId]);
        this.broadcastPresenceUpdate(presence[userId]);
        this.reconnectAttempts.delete(userId);
      }
    } catch (error) {
      console.error('Presence disconnection error:', error);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @WsUser('id') userId: string,
    @MessageBody() data: TypingEvent,
  ) {
    await this.presenceService.updateTypingStatus(
      userId,
      data.conversationId,
      data.isTyping,
    );

    // Broadcast to conversation participants
    this.server.to(`conversation:${data.conversationId}`).emit('typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('getPresence')
  async handleGetPresence(
    @MessageBody() userIds: string[],
  ): Promise<Record<string, UserPresence>> {
    return this.presenceService.getUsersPresence(userIds);
  }

  private broadcastPresenceUpdate(presence: UserPresence) {
    if (!presence) return;
    
    this.server.emit('presenceUpdate', {
      userId: presence.userId,
      status: presence.status,
      lastSeen: presence.lastSeen,
      typing: presence.typing,
    });
  }
}
