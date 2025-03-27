/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: any) {
    return 'Message created';
  }

  @Get()
  findAll() {
    return 'All messages fetched';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `Message with ID ${id} fetched`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: any) {
    return `Message with ID ${id} updated`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `Message with ID ${id} removed`;
  }
}
