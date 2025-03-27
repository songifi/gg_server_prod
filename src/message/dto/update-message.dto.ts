import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '../enum/message-type.enum';

export class UpdateMessageDto {
  @ApiPropertyOptional({
    example: 'Updated message content',
    description: 'Updated message content',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    example: 'media',
    enum: MessageType,
    description: 'Updated message type',
  })
  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;
}
