import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { TokenType } from '../enum/token-type.enum';

export class TransferTokenDto {
  @ApiProperty({
    description: 'ID of the user to receive the token',
    example: 'b3f64c9a-4c45-47f9-bc6a-217cae6d26f3',
  })
  @IsString()
  receiverId: string;

  @ApiProperty({
    description: 'Type of token to transfer',
    enum: TokenType,
    example: TokenType.FUNGIBLE,
  })
  @IsEnum(TokenType)
  tokenType: TokenType;

  @ApiProperty({
    description: 'ID of the NFT to transfer (required for NFT transfers)',
    example: '123',
    required: false,
  })
  @IsString()
  @IsOptional()
  tokenId?: string;

  @ApiProperty({
    description: 'Amount to transfer (required for fungible token transfers)',
    example: 1.5,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;
}
