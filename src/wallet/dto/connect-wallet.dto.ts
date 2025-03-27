import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConnectWalletDto {
  @ApiProperty({
    description: 'Starknet wallet address',
    example: '0x0123...',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^0x[a-fA-F0-9]{63,64}$/, {
    message: 'Invalid Starknet wallet address format',
  })
  address: string;

  @ApiProperty({
    description: 'Signature to verify wallet ownership',
    example: '0x0123...',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;
}
