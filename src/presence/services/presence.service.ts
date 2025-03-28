import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPresence, UserPresenceStatus, PresenceUpdate } from '../types/presence.types';

const PRESENCE_EVENT = 'presence:updates';
const PRESENCE_KEY_PREFIX = 'presence:user:';
const TYPING_TIMEOUT = 5000; // 5 seconds
const AWAY_TIMEOUT = 300000; // 5 minutes

@Injectable()
export class PresenceService implements OnModuleInit {
  private readonly presenceByUser = new Map<string, UserPresence>();
  private readonly heartbeatIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit() {
    // Subscribe to presence updates
    this.eventEmitter.on(PRESENCE_EVENT, (update: PresenceUpdate) => {
      this.handlePresenceUpdate(update, false);
    });
  }

  private async handlePresenceUpdate(update: PresenceUpdate, broadcast: boolean = true): Promise<void> {
    const currentPresence = await this.getPresence(update.userId);
    if (!currentPresence) return;

    const updatedPresence: UserPresence = {
      ...currentPresence,
      ...(update.status && { status: update.status }),
      ...(update.typing && {
        typing: {
          conversationId: update.typing.conversationId,
          timestamp: new Date()
        }
      })
    };

    // Only update cache if this is the originating instance
    if (broadcast) {
      await this.updatePresence(update.userId, updatedPresence);
    } else {
      // Just update local cache for updates from other instances
      this.presenceByUser.set(update.userId, updatedPresence);
    }
  }

  async handleConnection(userId: string, clientId: string): Promise<UserPresence> {
    const presence = await this.getPresence(userId);
    const updatedPresence: UserPresence = {
      ...presence,
      status: UserPresenceStatus.ONLINE,
      lastSeen: new Date(),
      deviceCount: (presence?.deviceCount || 0) + 1
    };

    await this.updatePresence(userId, updatedPresence);
    this.setupHeartbeat(userId, clientId);

    return updatedPresence;
  }

  async handleDisconnection(userId: string, clientId: string): Promise<void> {
    const presence = await this.getPresence(userId);
    if (!presence) return;

    const deviceCount = Math.max(0, presence.deviceCount - 1);
    const updatedPresence: UserPresence = {
      ...presence,
      deviceCount,
      status: deviceCount === 0 ? UserPresenceStatus.OFFLINE : presence.status,
      lastSeen: deviceCount === 0 ? new Date() : presence.lastSeen
    };

    await this.updatePresence(userId, updatedPresence);
    this.clearHeartbeat(userId, clientId);
  }

  async updateTypingStatus(userId: string, conversationId: string, isTyping: boolean): Promise<void> {
    const presence = await this.getPresence(userId);
    if (!presence) return;

    const updatedPresence: UserPresence = {
      ...presence,
      typing: isTyping ? {
        conversationId,
        timestamp: new Date()
      } : undefined
    };

    await this.updatePresence(userId, updatedPresence);
    
    // Clear typing status after timeout
    if (isTyping) {
      setTimeout(async () => {
        const currentPresence = await this.getPresence(userId);
        if (currentPresence?.typing?.conversationId === conversationId) {
          await this.updateTypingStatus(userId, conversationId, false);
        }
      }, TYPING_TIMEOUT);
    }
  }

  private async updatePresence(userId: string, presence: UserPresence): Promise<void> {
    this.presenceByUser.set(userId, presence);
    await this.cacheManager.set(
      `${PRESENCE_KEY_PREFIX}${userId}`,
      presence,
      86400000 // 24 hours in milliseconds
    );

    // Emit update event
    const update: PresenceUpdate = {
      userId,
      status: presence.status,
      typing: presence.typing ? {
        conversationId: presence.typing.conversationId,
        isTyping: true
      } : undefined
    };

    this.eventEmitter.emit(PRESENCE_EVENT, update);
  }

  private async getPresence(userId: string): Promise<UserPresence | null> {
    // Check local cache first
    const cached = this.presenceByUser.get(userId);
    if (cached) return cached;

    // Check distributed cache
    const stored = await this.cacheManager.get<UserPresence>(`${PRESENCE_KEY_PREFIX}${userId}`);
    if (!stored) return null;

    this.presenceByUser.set(userId, stored);
    return stored;
  }

  private setupHeartbeat(userId: string, clientId: string): void {
    const key = `${userId}:${clientId}`;
    const interval = setInterval(async () => {
      const presence = await this.getPresence(userId);
      if (!presence) return;

      const now = new Date();
      const timeSinceActivity = now.getTime() - presence.lastActivity.getTime();

      if (timeSinceActivity > AWAY_TIMEOUT && presence.status === UserPresenceStatus.ONLINE) {
        const updatedPresence: UserPresence = {
          ...presence,
          status: UserPresenceStatus.AWAY,
          lastActivity: presence.lastActivity // Keep the last activity time
        };
        await this.updatePresence(userId, updatedPresence);
      }
    }, AWAY_TIMEOUT / 2);

    this.heartbeatIntervals.set(key, interval);
  }

  private clearHeartbeat(userId: string, clientId: string): void {
    const key = `${userId}:${clientId}`;
    const interval = this.heartbeatIntervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(key);
    }
  }

  async getUsersPresence(userIds: string[]): Promise<Record<string, UserPresence>> {
    const result: Record<string, UserPresence> = {};
    
    await Promise.all(
      userIds.map(async (userId) => {
        const presence = await this.getPresence(userId);
        if (presence) {
          result[userId] = presence;
        }
      })
    );

    return result;
  }
}
