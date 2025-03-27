import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UserResponseDto extends OmitType(CreateUserDto, [
  'password',
] as const) {
  @ApiProperty({
    example: 'c5f9b3f3-6c2d-4b2b-8f97-3e1b6a42d9a8',
    description: 'Unique user ID',
  })
  id: string;

  @ApiProperty({
    example: '2024-03-27T12:00:00Z',
    description: 'Date when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-03-27T12:30:00Z',
    description: 'Date when the user was last updated',
  })
  updatedAt: Date;
}
