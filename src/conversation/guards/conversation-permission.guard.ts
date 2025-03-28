import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConversationService } from '../conversation.service';
import { ConversationParticipantRole } from '../entities/conversation-participation.entity';

@Injectable()
export class ConversationPermissionGuard implements CanActivate {
  constructor(private readonly conversationService: ConversationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const conversationId = request.params.id;
    const targetUserId = request.params.userId || request.body.userId;

    if (!userId || !conversationId) {
      return false;
    }

    const participant = await this.conversationService.getParticipant(
      conversationId,
      userId,
    );

    if (!participant) {
      return false;
    }

    // For self-removal, any participant can remove themselves
    if (targetUserId === userId) {
      return true;
    }

    // For other operations, check role-based permissions
    switch (participant.role) {
      case ConversationParticipantRole.ADMIN:
        return true;
      case ConversationParticipantRole.MODERATOR:
        // Moderators can't modify admins
        if (targetUserId) {
          const targetParticipant = await this.conversationService.getParticipant(
            conversationId,
            targetUserId,
          );
          return (
            !targetParticipant ||
            targetParticipant.role !== ConversationParticipantRole.ADMIN
          );
        }
        return true;
      default:
        return false;
    }
  }
}
