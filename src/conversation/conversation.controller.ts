import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddParticipantDto } from './dto/add-participant.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationPermissionGuard } from './guards/conversation-permission.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Conversations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a conversation by ID' })
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(id, updateConversationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation by ID' })
  remove(@Param('id') id: string) {
    return this.conversationService.remove(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all conversations' })
  findAll() {
    return this.conversationService.findAll();
  }

  @Get()
  @ApiOperation({
    summary: 'List user conversations with last message preview',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of conversations',
  })
  @ApiQuery({ type: ListConversationsDto })
  async listConversations(
    @CurrentUser('id') userId: string,
    @Query() query: ListConversationsDto,
  ) {
    return this.conversationService.listConversations(userId, query);
  }

  @Post(':id/participants')
  @UseGuards(ConversationPermissionGuard)
  @ApiOperation({ summary: 'Add a participant to a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiResponse({
    status: 201,
    description: 'Participant added successfully',
  })
  async addParticipant(
    @Param('id') id: string,
    @Body() addParticipantDto: AddParticipantDto,
  ) {
    return this.conversationService.addParticipant(id, addParticipantDto);
  }

  @Delete(':id/participants/:userId')
  @UseGuards(ConversationPermissionGuard)
  @ApiOperation({ summary: 'Remove a participant from a conversation' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({
    status: 200,
    description: 'Participant removed successfully',
  })
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.conversationService.removeParticipant(id, userId);
    return { message: 'Participant removed successfully' };
  }
}
