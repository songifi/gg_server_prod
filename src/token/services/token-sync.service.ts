import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenTransaction } from '../entities/token-transaction.entity';
import { User } from '../../users/entities/user.entity';
import { TokenType } from '../enum/token-type.enum';
import { TransactionStatus } from '../enum/transaction-status.enum';
import { ConfigService } from '@nestjs/config';
import { RpcProvider } from 'starknet';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Contract, GetTransactionReceiptResponse } from 'starknet';
import { WalletService } from '../../wallet/wallet.service';
import { UsersService } from '../../users/users.service';

interface TransferEvent {
  data: string[];
  from_address: string;
  keys: string[];
  to_address: string;
  transaction_hash: string;
}

@Injectable()
export class TokenSyncService {
  private readonly logger = new Logger(TokenSyncService.name);
  private readonly provider: RpcProvider;
  private lastSyncedBlock: number;

  constructor(
    @InjectRepository(TokenTransaction)
    private readonly tokenTransactionRepository: Repository<TokenTransaction>,
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
  ) {
    this.provider = new RpcProvider({
      nodeUrl: this.configService.get<string>('STARKNET_RPC_URL'),
    });
    this.lastSyncedBlock = 0;
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async syncTransactions() {
    try {
      this.logger.log('Starting transaction sync...');

      const currentBlock = await this.provider.getBlockNumber();
      if (this.lastSyncedBlock === 0) {
        // First run, only sync last 100 blocks
        this.lastSyncedBlock = Math.max(0, currentBlock - 100);
      }

      const tokenAddresses = [
        this.configService.get<string>('TOKEN_CONTRACT_ADDRESS'),
        this.configService.get<string>('NFT_CONTRACT_ADDRESS'),
      ].filter(Boolean);

      for (const tokenAddress of tokenAddresses) {
        await this.syncTokenTransactions(tokenAddress, this.lastSyncedBlock, currentBlock);
      }

      this.lastSyncedBlock = currentBlock;
      this.logger.log('Transaction sync completed');
    } catch (error) {
      this.logger.error('Error syncing transactions:', error.stack);
    }
  }

  private async syncTokenTransactions(
    tokenAddress: string,
    fromBlock: number,
    toBlock: number,
  ) {
    const contract = new Contract(
      this.configService.get('TOKEN_CONTRACT_ABI'),
      tokenAddress,
      this.provider,
    );

    // Get transfer events
    const events = await this.provider.getEvents({
      address: tokenAddress,
      from_block: { block_number: fromBlock },
      to_block: { block_number: toBlock },
      keys: [['0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9']], // Transfer event
      chunk_size: 100,
    });

    for (const event of events.events) {
      try {
        // Parse event data
        const [from_address, to_address, value, token_id] = event.data;
        const transaction_hash = event.transaction_hash;
        
        // Get transaction receipt for status
        const receipt: GetTransactionReceiptResponse = await this.provider.getTransactionReceipt(
          transaction_hash,
        );

        // Find users by wallet addresses
        const [senderWallet, receiverWallet] = await Promise.all([
          this.walletService.findByAddress(from_address),
          this.walletService.findByAddress(to_address),
        ]);

        if (!senderWallet?.userId || !receiverWallet?.userId) {
          this.logger.warn(
            `Skipping transaction ${transaction_hash}: Wallet not found for address`,
          );
          continue;
        }

        const [sender, receiver] = await Promise.all([
          this.usersService.findById(senderWallet.userId),
          this.usersService.findById(receiverWallet.userId),
        ]);

        if (!sender || !receiver) {
          this.logger.warn(
            `Skipping transaction ${transaction_hash}: User not found for wallet`,
          );
          continue;
        }

        // Check if transaction already exists
        const existingTransaction = await this.tokenTransactionRepository.findOne({
          where: { txHash: transaction_hash },
        });

        // Create transaction record
        const transaction = this.tokenTransactionRepository.create({
          senderId: sender.id,
          receiverId: receiver.id,
          tokenType: TokenType.FUNGIBLE,
          amount: value.toString(),
          txHash: transaction_hash,
          status: TransactionStatus.CONFIRMED,
          gasFee: '0', // This should be updated with actual gas fee
        });

        if (existingTransaction) {
          // Update existing transaction
          Object.assign(existingTransaction, transaction);
          await this.tokenTransactionRepository.save(existingTransaction);
        } else {
          // Create new transaction
          await this.tokenTransactionRepository.save(transaction);
        }
      } catch (error) {
        this.logger.error(
          `Error processing transaction event: ${error.message}`,
          error.stack,
        );
        continue;
      }
    }
  }
}
