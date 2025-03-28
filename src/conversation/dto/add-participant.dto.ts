import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ConversationParticipantRole } from '../entities/conversation-participation.entity';

export class AddParticipantDto {
  @ApiProperty({
    description: 'UUID of the user to add to the conversation',
    example: 'b3f64c9a-4c45-47f9-bc6a-217cae6d26f3',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Role to assign to the participant',
    enum: ConversationParticipantRole,
    example: ConversationParticipantRole.MEMBER,
    required: false,
  })
  @IsEnum(ConversationParticipantRole)
  @IsOptional()
  role?: ConversationParticipantRole;
}
