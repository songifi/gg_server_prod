import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ): Promise<MessageResponseDto> {
    return this.messageService.create({
      ...createMessageDto,
      senderId: user.id,
    });
  }

  @Get()
  async findAll(): Promise<MessageResponseDto[]> {
    return this.messageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MessageResponseDto> {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.messageService.remove(id);
  }

  @Get('/history')
  async getMessageHistory(
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.messageService.getMessageHistory(
      senderId,
      receiverId,
      Number(page),
      Number(limit),
      { type, startDate, endDate },
    );
  }

  @Get('/search')
  async searchMessages(
    @Query('query') query: string,
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
  ): Promise<MessageResponseDto[]> {
    return this.messageService.searchMessages(query, senderId, receiverId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    const message = await this.messageService.markAsRead(id, user.id);
    if (message) {
      // No content response, the WebSocket will handle real-time updates
      return;
    }
  }
}
