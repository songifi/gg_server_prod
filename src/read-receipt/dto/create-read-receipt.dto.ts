import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateReadReceiptDto {
  @ApiProperty({
    description: 'The ID of the user who read the message',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  readerId: string;

  @ApiProperty({
    description: 'The ID of the message that was read',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  messageId: string;
}
