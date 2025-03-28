export enum UserPresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline'
}

export interface UserPresence {
  userId: string;
  status: UserPresenceStatus;
  lastSeen: Date;
  lastActivity: Date;
  deviceCount: number;
  typing?: {
    conversationId: string;
    timestamp: Date;
  };
}

export interface PresenceUpdate {
  userId: string;
  status?: UserPresenceStatus;
  typing?: {
    conversationId: string;
    isTyping: boolean;
  };
}
