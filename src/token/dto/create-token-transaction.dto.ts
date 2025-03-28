import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from 'starknet';

export class CreateTokenTransactionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Sender ID (UUID)' })
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Receiver ID (UUID)' })
  receiverId: string;

  @IsEnum(TokenType)
  @ApiProperty({ enum: TokenType, description: 'Token type (fungible or NFT)' })
  tokenType: TokenType;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Token ID (only for NFTs)', required: false })
  tokenId?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    description: 'Amount (only for fungible tokens)',
    required: false,
  })
  amount?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Blockchain transaction hash' })
  txHash: string;

  @IsEnum(TransactionStatus)
  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;
}
