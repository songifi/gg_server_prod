import { ApiProperty } from '@nestjs/swagger'; // Swagger decorator
import { IsBoolean } from 'class-validator'; // Validation decorators

export class CreateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Enable or disable email notifications',
    example: true,
  })
  @IsBoolean()
  emailEnabled: boolean;

  @ApiProperty({
    description: 'Enable or disable SMS notifications',
    example: true,
  })
  @IsBoolean()
  smsEnabled: boolean;

  @ApiProperty({
    description: 'Enable or disable push notifications',
    example: true,
  })
  @IsBoolean()
  pushEnabled: boolean;

  @ApiProperty({
    description: 'Enable or disable in-app notifications',
    example: true,
  })
  @IsBoolean()
  inAppEnabled: boolean;
}
