import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PresenceService } from './services/presence.service';
import { UserPresence } from './types/presence.types';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('presence')
@Controller('presence')
@UseGuards(AuthGuard('jwt'))
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get presence status for a single user' })
  @ApiResponse({ status: 200, description: 'Returns the user presence information' })
  async getUserPresence(@Param('userId') userId: string): Promise<UserPresence | null> {
    const presence = await this.presenceService.getUsersPresence([userId]);
    return presence[userId] || null;
  }

  @Get('users')
  @ApiOperation({ summary: 'Get presence status for multiple users' })
  @ApiResponse({ status: 200, description: 'Returns presence information for requested users' })
  async getBulkPresence(@Query('userIds') userIds: string[]): Promise<Record<string, UserPresence>> {
    return this.presenceService.getUsersPresence(userIds);
  }
}
