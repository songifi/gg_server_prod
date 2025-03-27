import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentP@ss123',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (min 8 chars, must contain uppercase, lowercase, number)',
    example: 'NewStrongP@ss123',
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and numbers',
  })
  newPassword: string;
}
