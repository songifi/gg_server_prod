import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ModerationService } from '../services/moderation.service';
import { ModerationQueue, ModerationStatus } from '../entities/moderation-queue.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { User } from '../../users/entities/user.entity';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('queue')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async getQueue(
    @Query('status') status?: ModerationStatus,
  ): Promise<ModerationQueue[]> {
    return this.moderationService.getQueue(status);
  }

  @Post('queue/:id/review')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  async reviewContent(
    @Param('id') id: string,
    @Body() data: { approved: boolean; notes?: string },
    @GetUser() moderator: User,
  ): Promise<ModerationQueue> {
    return this.moderationService.reviewContent(
      id,
      moderator,
      data.approved,
      data.notes,
    );
  }
}
