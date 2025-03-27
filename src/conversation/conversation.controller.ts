import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@ApiTags('Conversations')
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
}
