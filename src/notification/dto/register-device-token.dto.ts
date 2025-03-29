import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DevicePlatform } from '../entities/device-token.entity';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Device token for push notifications' })
  token: string;

  @IsEnum(DevicePlatform)
  @ApiProperty({
    enum: DevicePlatform,
    description: 'Platform of the device (iOS, Android, Web)',
  })
  platform: DevicePlatform;

  @IsOptional()
  @ApiProperty({
    description: 'Additional device metadata',
    required: false,
  })
  metadata?: Record<string, any>;
}
