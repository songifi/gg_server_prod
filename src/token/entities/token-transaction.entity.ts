import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { TransactionErrorCode, RecoveryAction } from '../enum/transaction-error.enum';

@Entity('token_transactions')
export class TokenTransaction {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the transaction' })
  id: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ name: 'receiver_id' })
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  @Index()
  @ApiProperty({ description: 'Sender of the token' })
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  @Index()
  @ApiProperty({ description: 'Receiver of the token' })
  receiver: User;

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
  amount?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Transaction hash on StarkNet' })
  txHash: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  @ApiProperty({ enum: TransactionStatus, description: 'Current status of the transaction' })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionErrorCode, nullable: true })
  @ApiProperty({ enum: TransactionErrorCode, description: 'Error code if transaction failed' })
  errorCode?: TransactionErrorCode;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ description: 'Detailed error message if transaction failed' })
  errorMessage?: string;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ enum: RecoveryAction, isArray: true, description: 'Available recovery actions' })
  recoveryOptions?: RecoveryAction[];

  @Column({ type: 'decimal', precision: 20, scale: 0 })
  @ApiProperty({ description: 'Gas fee for the transaction' })
  gasFee: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Transaction creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
