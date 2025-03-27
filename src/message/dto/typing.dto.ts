import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class TypingDto {
  @IsNotEmpty()
  @IsUUID()
  conversationId: string;

  @IsNotEmpty()
  @IsBoolean()
  isTyping: boolean;
}
