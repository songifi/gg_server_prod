import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john_doe', description: 'Unique username' })
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Valid email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongP@ss123',
    description: 'Password (min 8 chars, must include uppercase, lowercase, number)',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}
