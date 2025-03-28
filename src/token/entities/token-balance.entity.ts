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

@Entity()
export class TokenBalance {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the balance record' })
  id: string;

  @ManyToOne(() => User, { eager: true })
  @Index()
  @ApiProperty({ description: 'User who owns the tokens' })
  user: User;

  @Column()
  @Index()
  @ApiProperty({ description: 'Token contract address' })
  tokenAddress: string;

  @Column({ type: 'enum', enum: TokenType })
  @ApiProperty({ enum: TokenType, description: 'Type of token (fungible/NFT)' })
  tokenType: TokenType;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: '0' })
  @ApiProperty({ description: 'Current token balance' })
  balance: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Last block number when balance was updated' })
  lastBlockNumber: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the balance record was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the balance was last updated' })
  updatedAt: Date;
}
