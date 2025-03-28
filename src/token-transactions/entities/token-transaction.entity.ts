import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from 'starknet';

@Entity()
export class TokenTransaction {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  id: string;

  @ManyToOne(() => User, (user) => user.sentTransactions, { lazy: true })
  @Index()
  @ApiProperty({ description: 'Sender of the token' })
  sender: Promise<User>;

  @ManyToOne(() => User, (user) => user.receivedTransactions, { lazy: true })
  @Index()
  @ApiProperty({ description: 'Receiver of the token' })
  receiver: Promise<User>;

  @Column({ type: 'enum', enum: TokenType })
  @ApiProperty({ enum: TokenType, description: 'Type of token (fungible/NFT)' })
  tokenType: TokenType;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Token ID (only for NFTs)', required: false })
  tokenId?: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  @ApiProperty({
    description: 'Amount (only for fungible tokens)',
    required: false,
  })
  amount?: number;

  @Column({ unique: true })
  @Index()
  @ApiProperty({ description: 'Blockchain transaction hash' })
  txHash: string;

  @Column({ type: 'enum', enum: TransactionStatus })
  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;

  @CreateDateColumn()
  @ApiProperty({ description: 'Transaction creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
